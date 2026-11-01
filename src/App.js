import React, { useState, useRef, useCallback, useEffect } from "react";
import Auth from "./components/Auth";
import TopTracks from "./components/TopTracks";
import TopArtists from "./components/TopArtists";
import TopAlbums from "./components/TopAlbums";
import RecentlyPlayed from "./components/RecentlyPlayed";
import { SpotifyAttribution } from "./components/SpotifyBrand";
import { startTokenAutoRefresh } from "./config/spotifyToken";
import { useArtworkColor } from "./utils/artworkColor";
import {
  Header,
  HeaderLeft,
  HeaderTitle,
  MainContainer,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  ToolbarRow,
  SectionInfo,
  PeriodTabs,
  PeriodTabList,
  PeriodTab,
  WelcomeCard,
} from "./styles/LayoutStyle";
import MainLogo from "./img/logo.svg";
import {
  PlayerWrapper,
  PlayerToggle,
  MiniProgress,
  SeekBarContainer,
  SeekTime,
  SeekSlider,
  VolumeContainer,
  VolumeIconButton,
  VolumeStepButton,
  VolumeSlider,
  VolumePercentage,
  playerStyles,
} from "./styles/PlayerStyles";
import SpotifyPlayer from "react-spotify-web-playback";

const TAB_DETAILS = [
  {
    title: "Top Tracks",
    subtitle: "Suas faixas mais reproduzidas — clique em qualquer música para ouvir",
  },
  {
    title: "Top Albums",
    subtitle: "Os álbuns que dominaram a sua fila de reprodução",
  },
  {
    title: "Top Artists",
    subtitle: "Os artistas que definem a sua trilha sonora",
  },
  {
    title: "Tocadas Recentemente",
    subtitle: "As últimas 50 faixas que você ouviu, da mais recente para a mais antiga",
  },
];

const formatTime = (ms) => {
  if (!ms || ms < 0 || !Number.isFinite(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const MOBILE_PLAYER_QUERY = "(max-width: 820px)";
const SWIPE_DISTANCE_PX = 40;

const VolumeIcon = ({ volume, isMuted }) => {
  if (isMuted || volume === 0) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  if (volume < 45) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
};

function App() {
  const [token, setToken] = useState("");
  const [currentTrackUri, setCurrentTrackUri] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState("short_term");

  // Estados de progresso da faixa (Seek Bar customizada)
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerImage, setPlayerImage] = useState("");
  const playerColor = useArtworkColor(playerImage);

  const isDraggingSeekRef = useRef(false);
  const seekReleaseTimerRef = useRef(null);
  const seekThrottleTimerRef = useRef(null);
  const lastSeekExecutionRef = useRef(0);

  // Estados de volume
  const [volume, setVolume] = useState(() => {
    const saved = window.localStorage.getItem("spotify_tracker_volume");
    return saved !== null ? Number(saved) : 70;
  });
  const [isMuted, setIsMuted] = useState(false);

  const previousVolumeRef = useRef(volume > 0 ? volume : 70);
  const playerRef = useRef(null);
  const sdkThrottleTimer = useRef(null);
  const lastSdkExecution = useRef(0);

  // Mini player: expandido, ocupa uma entrada no histórico para o "voltar" do celular recolhê-lo
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const swipeStartYRef = useRef(null);

  useEffect(() => {
    // Recarregar com o player aberto mantém a marca na entrada do histórico:
    // sem limpá-la, voltar para essa entrada reabriria o player
    if (window.history.state?.playerExpanded) {
      window.history.replaceState(null, "");
    }

    const handlePopState = (e) => setIsPlayerExpanded(!!e.state?.playerExpanded);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const expandPlayer = () => {
    window.history.pushState({ playerExpanded: true }, "");
    setIsPlayerExpanded(true);
  };

  // Recolhe na hora: o history.back() é assíncrono e pode demorar a disparar o popstate
  const collapsePlayer = () => {
    setIsPlayerExpanded(false);
    if (window.history.state?.playerExpanded) window.history.back();
  };

  const handlePlayerTouchStart = (e) => {
    // Arrastar os sliders não conta como gesto de expandir ou recolher
    const isSlider = e.target.matches('input[type="range"]');
    const isMobile = window.matchMedia(MOBILE_PLAYER_QUERY).matches;
    swipeStartYRef.current = isSlider || !isMobile ? null : e.touches[0].clientY;
  };

  const handlePlayerTouchEnd = (e) => {
    if (swipeStartYRef.current === null) return;
    const distance = swipeStartYRef.current - e.changedTouches[0].clientY;
    swipeStartYRef.current = null;

    if (distance > SWIPE_DISTANCE_PX && !isPlayerExpanded) expandPlayer();
    if (distance < -SWIPE_DISTANCE_PX && isPlayerExpanded) collapsePlayer();
  };

  // Renova o token enquanto o app está aberto, sem interromper a sessão
  useEffect(() => {
    if (!token) return undefined;
    return startTokenAutoRefresh(setToken);
  }, [token]);

  // Atualiza a barra de progresso suavemente enquanto a música está tocando
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(async () => {
      if (isDraggingSeekRef.current || !playerRef.current) return;
      try {
        const state = await playerRef.current.getCurrentState();
        if (state && !isDraggingSeekRef.current) {
          setProgressMs(state.position);
          if (state.track_window?.current_track?.duration_ms) {
            setDurationMs(state.track_window.current_track.duration_ms);
          }
        }
      } catch (e) {
        // Ignora erros transitórios de leitura de estado
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayerCallback = useCallback((state) => {
    setIsPlaying(!!state.isPlaying);
    if (state.track && state.track.durationMs) {
      setDurationMs(state.track.durationMs);
    }
    if (state.track?.image) {
      setPlayerImage(state.track.image);
    }
    if (!isDraggingSeekRef.current && typeof state.progressMs === "number") {
      setProgressMs(state.progressMs);
    }
  }, []);

  const syncSeekToPlayer = useCallback((targetMs, immediate = false) => {
    const clampedMs = Math.max(0, Math.round(targetMs));
    const now = performance.now();

    const executeSeek = () => {
      lastSeekExecutionRef.current = performance.now();
      if (playerRef.current && typeof playerRef.current.seek === "function") {
        playerRef.current.seek(clampedMs).catch(() => {});
      }
    };

    if (immediate || now - lastSeekExecutionRef.current >= 50) {
      clearTimeout(seekThrottleTimerRef.current);
      executeSeek();
    } else {
      clearTimeout(seekThrottleTimerRef.current);
      seekThrottleTimerRef.current = setTimeout(executeSeek, 50);
    }
  }, []);

  const handleSeekChange = (e) => {
    if (!durationMs) return;
    isDraggingSeekRef.current = true;
    clearTimeout(seekReleaseTimerRef.current);

    const nextProgress = Number(e.target.value);
    setProgressMs(nextProgress);
    syncSeekToPlayer(nextProgress, false);

    // Libera a atualização automática alguns milissegundos após parar de interagir
    seekReleaseTimerRef.current = setTimeout(() => {
      isDraggingSeekRef.current = false;
    }, 250);
  };

  const handleSeekCommit = () => {
    if (!durationMs) return;
    syncSeekToPlayer(progressMs, true);
    clearTimeout(seekReleaseTimerRef.current);
    seekReleaseTimerRef.current = setTimeout(() => {
      isDraggingSeekRef.current = false;
    }, 180);
  };

  const handleSeekWheel = (e) => {
    if (!durationMs) return;
    e.preventDefault();
    isDraggingSeekRef.current = true;
    const stepMs = e.deltaY < 0 ? 5000 : -5000;
    const nextProgress = Math.max(0, Math.min(durationMs, progressMs + stepMs));
    setProgressMs(nextProgress);
    syncSeekToPlayer(nextProgress, false);

    clearTimeout(seekReleaseTimerRef.current);
    seekReleaseTimerRef.current = setTimeout(() => {
      isDraggingSeekRef.current = false;
    }, 250);
  };

  const syncVolumeToPlayer = useCallback((targetVolume) => {
    const normalized = Math.max(0, Math.min(1, targetVolume / 100));
    const now = performance.now();

    const executeSetVolume = () => {
      lastSdkExecution.current = performance.now();
      if (playerRef.current && typeof playerRef.current.setVolume === "function") {
        playerRef.current.setVolume(normalized).catch(() => {});
      }
    };

    if (now - lastSdkExecution.current >= 25) {
      clearTimeout(sdkThrottleTimer.current);
      executeSetVolume();
    } else {
      clearTimeout(sdkThrottleTimer.current);
      sdkThrottleTimer.current = setTimeout(executeSetVolume, 25);
    }
  }, []);

  const applyVolume = useCallback(
    (rawValue) => {
      const clamped = Math.max(0, Math.min(100, Math.round(rawValue)));
      setVolume(clamped);
      setIsMuted(clamped === 0);
      window.localStorage.setItem("spotify_tracker_volume", String(clamped));

      if (clamped > 0) {
        previousVolumeRef.current = clamped;
      }

      syncVolumeToPlayer(clamped);
    },
    [syncVolumeToPlayer]
  );

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      const restored = previousVolumeRef.current > 0 ? previousVolumeRef.current : 60;
      applyVolume(restored);
    } else {
      previousVolumeRef.current = volume;
      applyVolume(0);
    }
  };

  const handleVolumeWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 4 : -4;
    const current = isMuted ? 0 : volume;
    applyVolume(current + delta);
  };

  const effectiveVolume = isMuted ? 0 : volume;
  const seekPercent =
    durationMs > 0 ? Math.min(100, Math.max(0, (progressMs / durationMs) * 100)) : 0;

  return (
    <div>
      <Header>
        <HeaderLeft>
          <img src={MainLogo} alt="SpotifyTracker" width={42} height={42} />
          <HeaderTitle>SpotifyTracker</HeaderTitle>
        </HeaderLeft>
        {token && (
          <TabList as="nav" aria-label="Seções">
            <Tab
              className={activeTab === 0 ? "active" : ""}
              aria-current={activeTab === 0 ? "page" : undefined}
              onClick={() => setActiveTab(0)}
            >
              Top Tracks
            </Tab>
            <Tab
              className={activeTab === 1 ? "active" : ""}
              aria-current={activeTab === 1 ? "page" : undefined}
              onClick={() => setActiveTab(1)}
            >
              Top Albums
            </Tab>
            <Tab
              className={activeTab === 2 ? "active" : ""}
              aria-current={activeTab === 2 ? "page" : undefined}
              onClick={() => setActiveTab(2)}
            >
              Top Artists
            </Tab>
            <Tab
              className={activeTab === 3 ? "active" : ""}
              aria-current={activeTab === 3 ? "page" : undefined}
              onClick={() => setActiveTab(3)}
            >
              Recentes
            </Tab>
          </TabList>
        )}
        <Auth setToken={setToken} />
      </Header>

      <MainContainer>
        {!token ? (
          <WelcomeCard>
            <img src={MainLogo} alt="SpotifyTracker" width={68} height={68} />
            <h1>Descubra suas estatísticas no Spotify</h1>
            <p>
              Visualize suas músicas, álbuns e artistas mais ouvidos em diferentes
              períodos e ouça tudo diretamente pelo player integrado.
            </p>
            <Auth setToken={setToken} />
          </WelcomeCard>
        ) : (
          <Tabs>
            <ToolbarRow>
              <SectionInfo>
                <h2>{TAB_DETAILS[activeTab].title}</h2>
                <p>{TAB_DETAILS[activeTab].subtitle}</p>
              </SectionInfo>
              {/* O histórico recente não tem período: a API devolve só as últimas faixas */}
              {activeTab !== 3 && (
                <PeriodTabs>
                  <PeriodTabList>
                    <PeriodTab
                      className={timeRange === "short_term" ? "active" : ""}
                      aria-pressed={timeRange === "short_term"}
                      onClick={() => setTimeRange("short_term")}
                    >
                      Últimas 4 Semanas
                    </PeriodTab>
                    <PeriodTab
                      className={timeRange === "medium_term" ? "active" : ""}
                      aria-pressed={timeRange === "medium_term"}
                      onClick={() => setTimeRange("medium_term")}
                    >
                      Últimos 6 Meses
                    </PeriodTab>
                    <PeriodTab
                      className={timeRange === "long_term" ? "active" : ""}
                      aria-pressed={timeRange === "long_term"}
                      onClick={() => setTimeRange("long_term")}
                    >
                      Todo o Período
                    </PeriodTab>
                  </PeriodTabList>
                </PeriodTabs>
              )}
            </ToolbarRow>

            <TabPanel className={activeTab === 0 ? "active" : ""}>
              <TopTracks
                token={token}
                currentTrackUri={currentTrackUri}
                setCurrentTrackUri={setCurrentTrackUri}
                timeRange={timeRange}
              />
            </TabPanel>
            <TabPanel className={activeTab === 1 ? "active" : ""}>
              <TopAlbums
                token={token}
                currentTrackUri={currentTrackUri}
                setCurrentTrackUri={setCurrentTrackUri}
                timeRange={timeRange}
              />
            </TabPanel>
            <TabPanel className={activeTab === 2 ? "active" : ""}>
              <TopArtists
                token={token}
                currentTrackUri={currentTrackUri}
                setCurrentTrackUri={setCurrentTrackUri}
                timeRange={timeRange}
              />
            </TabPanel>
            <TabPanel className={activeTab === 3 ? "active" : ""}>
              <RecentlyPlayed
                token={token}
                currentTrackUri={currentTrackUri}
                setCurrentTrackUri={setCurrentTrackUri}
                isActive={activeTab === 3}
              />
            </TabPanel>
            <SpotifyAttribution />
          </Tabs>
        )}
      </MainContainer>

      {token && (
        <PlayerWrapper
          role="region"
          aria-label="Player"
          data-expanded={isPlayerExpanded}
          style={playerColor ? { "--artwork-color": playerColor } : undefined}
          onTouchStart={handlePlayerTouchStart}
          onTouchEnd={handlePlayerTouchEnd}
        >
          <PlayerToggle
            type="button"
            onClick={isPlayerExpanded ? collapsePlayer : expandPlayer}
            aria-expanded={isPlayerExpanded}
            aria-label={isPlayerExpanded ? "Recolher player" : "Expandir player"}
            title={isPlayerExpanded ? "Recolher player" : "Expandir player"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 15 12 9 18 15" />
            </svg>
          </PlayerToggle>

          <SpotifyPlayer
            token={token}
            uris={currentTrackUri ? [currentTrackUri] : []}
            play={!!currentTrackUri}
            showSaveIcon={true}
            inlineVolume={false}
            initialVolume={effectiveVolume / 100}
            callback={handlePlayerCallback}
            getPlayer={(playerInstance) => {
              playerRef.current = playerInstance;
            }}
            magnifySliderOnHover={false}
            styles={playerStyles}
          />

          <MiniProgress
            className="player-mini-progress"
            style={{ transform: `scaleX(${seekPercent / 100})` }}
            aria-hidden="true"
          />

          <SeekBarContainer
            className="player-extra"
            onWheel={handleSeekWheel}
            title="Arraste para escolher o trecho da música ou use o scroll (±5s)"
          >
            <SeekTime $alignRight>{formatTime(progressMs)}</SeekTime>
            <SeekSlider
              type="range"
              min="0"
              max={durationMs || 100}
              step="100"
              disabled={!durationMs}
              value={Math.min(progressMs, durationMs || 100)}
              $percent={seekPercent}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              aria-label="Progresso da música"
            />
            <SeekTime>{formatTime(durationMs)}</SeekTime>
          </SeekBarContainer>

          <VolumeContainer
            className="player-extra"
            onWheel={handleVolumeWheel}
            title="Role o scroll do mouse ou arraste para ajustar o volume"
          >
            <VolumeIconButton
              type="button"
              onClick={toggleMute}
              $muted={effectiveVolume === 0}
              title={effectiveVolume === 0 ? "Ativar som" : "Silenciar"}
              aria-label={effectiveVolume === 0 ? "Ativar som" : "Silenciar"}
            >
              <VolumeIcon volume={effectiveVolume} isMuted={isMuted} />
            </VolumeIconButton>
            <VolumeStepButton
              type="button"
              onClick={() => applyVolume(effectiveVolume - 5)}
              title="Diminuir volume (-5%)"
              aria-label="Diminuir volume"
            >
              −
            </VolumeStepButton>
            <VolumeSlider
              type="range"
              min="0"
              max="100"
              step="1"
              value={effectiveVolume}
              $percent={effectiveVolume}
              onChange={(e) => applyVolume(Number(e.target.value))}
              aria-label="Volume"
            />
            <VolumeStepButton
              type="button"
              onClick={() => applyVolume(effectiveVolume + 5)}
              title="Aumentar volume (+5%)"
              aria-label="Aumentar volume"
            >
              +
            </VolumeStepButton>
            <VolumePercentage>{effectiveVolume}%</VolumePercentage>
          </VolumeContainer>
        </PlayerWrapper>
      )}
    </div>
  );
}

export default App;

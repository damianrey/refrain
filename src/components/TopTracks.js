import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  GridContainer,
  GridItem,
  RankBadge,
  CoverWrapper,
  ItemDetails,
  ItemMeta,
  RowButton,
  ActionBar,
  ActionButton,
  StatusMessage,
} from "../styles/LayoutStyle";
import { PERIOD_LABELS } from "../config/spotifyConfig";
import { OpenInSpotify } from "./SpotifyBrand";
import ShareTopButton from "./ShareTopButton";
import TopHero from "./TopHero";
import useSpotifyData from "../hooks/useSpotifyData";
import ListState from "./ListState";

const formatDuration = (ms) => {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// Cria uma playlist privada com as faixas, na ordem exibida.
// Tenta os endpoints novos (/me/playlists e /items) e recorre aos antigos se não existirem.
const createPlaylistFromTracks = async (token, name, description, uris) => {
  const headers = { Authorization: `Bearer ${token}` };
  const body = { name, description, public: false };

  let playlist;
  try {
    ({ data: playlist } = await axios.post(
      "https://api.spotify.com/v1/me/playlists",
      body,
      { headers }
    ));
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    const { data: me } = await axios.get("https://api.spotify.com/v1/me", { headers });
    ({ data: playlist } = await axios.post(
      `https://api.spotify.com/v1/users/${me.id}/playlists`,
      body,
      { headers }
    ));
  }

  try {
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlist.id}/items`,
      { uris },
      { headers }
    );
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      { uris },
      { headers }
    );
  }

  return playlist;
};

const TopTracks = ({ token, currentTrackUri, setCurrentTrackUri, timeRange }) => {
  const { data, status, retry } = useSpotifyData(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=30`,
    token
  );
  // A API já devolve as faixas na ordem do seu ranking pessoal
  const topTracks = data?.items ?? [];
  const [exportStatus, setExportStatus] = useState({ state: "idle" });

  useEffect(() => {
    setExportStatus({ state: "idle" });
  }, [timeRange]);

  const handleExport = async () => {
    if (!topTracks.length) return;
    setExportStatus({ state: "loading" });

    const period = PERIOD_LABELS[timeRange];
    const date = new Date().toLocaleDateString("pt-BR");
    try {
      const playlist = await createPlaylistFromTracks(
        token,
        `Top ${topTracks.length} · ${period}`,
        `Minhas ${topTracks.length} faixas mais ouvidas (${period.toLowerCase()}), gerada pelo Refrain em ${date}.`,
        topTracks.map((track) => track.uri)
      );
      setExportStatus({ state: "done", url: playlist.external_urls?.spotify });
    } catch (error) {
      console.error("Error exporting playlist:", error);
      const status = error.response?.status;
      setExportStatus({
        state: "error",
        message:
          status === 401 || status === 403
            ? "Sem permissão para criar playlists. Saia e entre de novo."
            : "Não foi possível criar a playlist. Tente novamente.",
      });
    }
  };


  const ranked = topTracks.slice(0, 30).map((track, index) => ({ ...track, rank: index + 1 }));

  const shareItems = ranked.map((track) => ({
    name: track.name,
    subtitle: track.artists.map((a) => a.name).join(", "),
    imageUrl: track.album.images[0]?.url,
  }));

  return (
    <>
      <ActionBar>
        {exportStatus.state === "done" && (
          <StatusMessage role="status">
            Playlist criada!{" "}
            {exportStatus.url && (
              <a href={exportStatus.url} target="_blank" rel="noreferrer">
                Abrir no Spotify
              </a>
            )}
          </StatusMessage>
        )}
        {exportStatus.state === "error" && (
          <StatusMessage $error role="alert">{exportStatus.message}</StatusMessage>
        )}
        <ActionButton
          type="button"
          onClick={handleExport}
          disabled={!topTracks.length || exportStatus.state === "loading"}
        >
          {exportStatus.state === "loading" ? "Criando playlist…" : "+ Salvar como playlist"}
        </ActionButton>
        <ShareTopButton
          title="Minhas faixas mais ouvidas"
          timeRange={timeRange}
          items={shareItems}
        />
      </ActionBar>
      <ListState
        status={status}
        isEmpty={topTracks.length === 0}
        emptyMessage="Ainda não há faixas suficientes neste período. Ouça mais músicas e volte depois."
        onRetry={retry}
      >
        <>
          {ranked[0] && (
            <TopHero
              imageUrl={ranked[0].album.images[0]?.url}
              title={ranked[0].name}
              subtitle={ranked[0].artists.map((a) => a.name).join(", ")}
              spotifyUrl={ranked[0].external_urls?.spotify}
              isPlaying={currentTrackUri === ranked[0].uri}
              onPlay={() => setCurrentTrackUri(ranked[0].uri)}
            />
          )}
          <GridContainer>
            {ranked.slice(1).map((track) => {
              const isPlaying = currentTrackUri === track.uri;
              return (
                <GridItem key={track.id} className={isPlaying ? "playing" : ""}>
                  <RowButton
                    type="button"
                    title={`${track.name} — ${track.artists.map((a) => a.name).join(", ")}`}
                    aria-label={`Tocar ${track.name}`}
                    aria-pressed={isPlaying}
                    onClick={() => setCurrentTrackUri(track.uri)}
                  />
                  <RankBadge $rank={track.rank}>
                    <span className="rank-text">#{track.rank}</span>
                    <span className="play-hint">{isPlaying ? "♫" : "▶"}</span>
                  </RankBadge>
                  <CoverWrapper>
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.name}
                      loading="lazy"
                    />
                  </CoverWrapper>
                  <ItemDetails>
                    <span className="item-title" title={track.name}>
                      {track.name}
                    </span>
                    <span
                      className="item-subtitle"
                      title={track.artists.map((a) => a.name).join(", ")}
                    >
                      {track.artists.map((a) => a.name).join(", ")}
                    </span>
                  </ItemDetails>
                  {track.duration_ms && (
                    <ItemMeta>{formatDuration(track.duration_ms)}</ItemMeta>
                  )}
                  <OpenInSpotify url={track.external_urls?.spotify} name={track.name} />
                </GridItem>
              );
            })}
          </GridContainer>
        </>
      </ListState>
    </>
  );
};

export default TopTracks;

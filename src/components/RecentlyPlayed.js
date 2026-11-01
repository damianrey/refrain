import React from "react";
import {
  GridContainer,
  GridItem,
  CoverWrapper,
  ItemDetails,
  ItemMeta,
  RankBadge,
  RowButton,
} from "../styles/LayoutStyle";
import { OpenInSpotify } from "./SpotifyBrand";
import useSpotifyData from "../hooks/useSpotifyData";
import ListState from "./ListState";

// "agora", "há 12 min", "há 3 h", "ontem, 21:40" ou "12/10, 18:05"
const formatPlayedAt = (isoDate) => {
  const playedAt = new Date(isoDate);
  const diffMinutes = Math.floor((Date.now() - playedAt.getTime()) / 60000);
  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffMinutes < 6 * 60) return `há ${Math.floor(diffMinutes / 60)} h`;

  const time = playedAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (playedAt.toDateString() === today.toDateString()) return `hoje, ${time}`;
  if (playedAt.toDateString() === yesterday.toDateString()) return `ontem, ${time}`;
  return `${playedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })}, ${time}`;
};

const RecentlyPlayed = ({ token, currentTrackUri, setCurrentTrackUri, isActive }) => {
  // Recarrega sempre que a aba é aberta, já que o histórico muda enquanto você ouve
  const { data, status, retry } = useSpotifyData(
    "https://api.spotify.com/v1/me/player/recently-played?limit=50",
    token,
    { enabled: isActive, cacheMs: 0 }
  );
  const recentItems = data?.items ?? [];

  return (
    <ListState
      status={status}
      isEmpty={recentItems.length === 0}
      emptyMessage="Nenhuma faixa tocada recentemente. Ouça algo no Spotify e volte aqui."
      onRetry={retry}
    >
      <GridContainer>
        {/* Sem colunas fixas: a ordem cronológica se mantém em qualquer largura */}
        {recentItems.map(({ track, played_at: playedAt }) => {
          const isPlaying = currentTrackUri === track.uri;
          return (
            <GridItem key={playedAt} className={isPlaying ? "playing" : ""}>
              <RowButton
                type="button"
                title={`${track.name} — ${new Date(playedAt).toLocaleString("pt-BR")}`}
                aria-label={`Tocar ${track.name}`}
                aria-pressed={isPlaying}
                onClick={() => setCurrentTrackUri(track.uri)}
              />
              {isPlaying && (
                <RankBadge>
                  <span className="play-hint">♫</span>
                </RankBadge>
              )}
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
              <ItemMeta title={new Date(playedAt).toLocaleString("pt-BR")}>
                {formatPlayedAt(playedAt)}
              </ItemMeta>
              <OpenInSpotify url={track.external_urls?.spotify} name={track.name} />
            </GridItem>
          );
        })}
      </GridContainer>
    </ListState>
  );
};

export default RecentlyPlayed;

import React from "react";
import {
  GridContainer,
  GridItem,
  RankBadge,
  CoverWrapper,
  ItemDetails,
  ItemMeta,
  RowButton,
  ActionBar,
} from "../styles/LayoutStyle";
import { OpenInSpotify } from "./SpotifyBrand";
import ShareTopButton from "./ShareTopButton";
import TopHero from "./TopHero";
import useSpotifyData from "../hooks/useSpotifyData";
import ListState from "./ListState";

// As páginas se sobrepõem em uma faixa, por causa do limite de 99
const mergeTrackPages = (pages) => {
  const tracks = new Map();
  (pages ?? []).forEach((page) => {
    page.items.forEach((track) => tracks.set(track.id, track));
  });
  return [...tracks.values()];
};

const getTopAlbums = (tracks) => {
  // Pontua cada álbum pelas posições das suas faixas no seu top:
  // quanto mais alta a faixa, mais pontos. Álbuns com várias faixas bem
  // colocadas sobem; empates mantêm a ordem da faixa mais bem colocada.
  const albumMap = new Map();
  tracks.forEach((track, index) => {
    const album = track.album;
    if (!albumMap.has(album.id)) {
      albumMap.set(album.id, { ...album, score: 0 });
    }
    albumMap.get(album.id).score += tracks.length - index;
  });
  return Array.from(albumMap.values()).sort((a, b) => b.score - a.score);
};

const TopAlbums = ({ token, currentTrackUri, setCurrentTrackUri, timeRange }) => {
  // A API limita cada página a 50 itens e o top a 99 faixas no total
  const { data, status, retry } = useSpotifyData(
    [0, 49].map(
      (offset) =>
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50&offset=${offset}`
    ),
    token
  );
  const topAlbums = getTopAlbums(mergeTrackPages(data));


  const ranked = topAlbums.slice(0, 30).map((album, index) => ({ ...album, rank: index + 1 }));

  const shareItems = ranked.map((album) => ({
    name: album.name,
    subtitle: album.artists.map((a) => a.name).join(", "),
    imageUrl: album.images[0]?.url,
  }));

  return (
    <>
      <ActionBar>
        <ShareTopButton
          title="Meus álbuns mais ouvidos"
          timeRange={timeRange}
          items={shareItems}
        />
      </ActionBar>
      <ListState
        status={status}
        isEmpty={ranked.length === 0}
        emptyMessage="Ainda não há álbuns suficientes neste período. Ouça mais músicas e volte depois."
        onRetry={retry}
      >
        <>
          {ranked[0] && (
            <TopHero
              imageUrl={ranked[0].images[0]?.url}
              title={ranked[0].name}
              subtitle={ranked[0].artists.map((a) => a.name).join(", ")}
              spotifyUrl={ranked[0].external_urls?.spotify}
              isPlaying={currentTrackUri === ranked[0].uri}
              onPlay={() => setCurrentTrackUri(ranked[0].uri)}
            />
          )}
          <GridContainer>
            {ranked.slice(1).map((album) => {
              const isPlaying = currentTrackUri === album.uri;
              const releaseYear = album.release_date
                ? album.release_date.split("-")[0]
                : "";
              return (
                <GridItem key={album.id} className={isPlaying ? "playing" : ""}>
                  <RowButton
                    type="button"
                    title={`${album.name} — ${album.artists.map((a) => a.name).join(", ")}`}
                    aria-label={`Tocar ${album.name}`}
                    aria-pressed={isPlaying}
                    onClick={() => setCurrentTrackUri(album.uri)}
                  />
                  <RankBadge $rank={album.rank}>
                    <span className="rank-text">#{album.rank}</span>
                    <span className="play-hint">{isPlaying ? "♫" : "▶"}</span>
                  </RankBadge>
                  <CoverWrapper>
                    <img
                      src={album.images[0]?.url}
                      alt={album.name}
                      loading="lazy"
                    />
                  </CoverWrapper>
                  <ItemDetails>
                    <span className="item-title" title={album.name}>
                      {album.name}
                    </span>
                    <span
                      className="item-subtitle"
                      title={album.artists.map((a) => a.name).join(", ")}
                    >
                      {album.artists.map((a) => a.name).join(", ")}
                    </span>
                  </ItemDetails>
                  {releaseYear && <ItemMeta>{releaseYear}</ItemMeta>}
                  <OpenInSpotify url={album.external_urls?.spotify} name={album.name} />
                </GridItem>
              );
            })}
          </GridContainer>
        </>
      </ListState>
    </>
  );
};

export default TopAlbums;

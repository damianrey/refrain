import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  GridContainer,
  GridItem,
  RankBadge,
  CoverWrapper,
  ItemDetails,
  ItemMeta,
  ChartCard,
  BarRow,
  BarTrack,
  BarFill,
} from "../styles/LayoutStyle";
import { OpenInSpotify } from "./SpotifyBrand";

const MAX_GENRES = 8;

// Conta em quantos dos seus top artistas cada gênero aparece
const getTopGenres = (artists) => {
  const genreMap = new Map();
  artists.forEach((artist) => {
    (artist.genres || []).forEach((genre) => {
      if (!genreMap.has(genre)) genreMap.set(genre, []);
      genreMap.get(genre).push(artist.name);
    });
  });
  return [...genreMap.entries()]
    .map(([genre, artistNames]) => ({ genre, artistNames }))
    .sort((a, b) => b.artistNames.length - a.artistNames.length)
    .slice(0, MAX_GENRES);
};

const GenreChart = ({ artists }) => {
  if (!artists.length) return null;

  const topGenres = getTopGenres(artists);
  const maxCount = topGenres[0]?.artistNames.length || 1;

  return (
    <ChartCard aria-label="Seus gêneros mais ouvidos">
      <h3>Seus gêneros</h3>
      <p>Em quantos dos seus {artists.length} artistas mais ouvidos cada gênero aparece</p>
      {topGenres.length === 0 ? (
        <p>O Spotify não informou gêneros para esses artistas.</p>
      ) : (
        <div role="list">
          {topGenres.map(({ genre, artistNames }) => (
            <BarRow
              key={genre}
              role="listitem"
              title={`${genre}: ${artistNames.join(", ")}`}
            >
              <span className="bar-label">{genre}</span>
              <BarTrack>
                <BarFill $percent={(artistNames.length / maxCount) * 100} />
              </BarTrack>
              <span className="bar-value">
                {artistNames.length} {artistNames.length === 1 ? "artista" : "artistas"}
              </span>
            </BarRow>
          ))}
        </div>
      )}
    </ChartCard>
  );
};

const TopArtists = ({
  token,
  currentTrackUri,
  setCurrentTrackUri,
  timeRange,
}) => {
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    if (token) {
      axios
        .get(
          `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=30`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          // A API já devolve os artistas na ordem do seu ranking pessoal
          setTopArtists(response.data.items);
        })
        .catch((error) => {
          console.error("Error fetching top artists:", error);
          if (error.response && error.response.status === 401) {
            window.localStorage.removeItem("token");
            window.location.reload();
          }
        });
    }
  }, [token, timeRange]);

  const ranked = topArtists.slice(0, 30).map((artist, index) => ({ ...artist, rank: index + 1 }));

  return (
    <>
      <GenreChart artists={topArtists} />
      <GridContainer>
        {ranked.map((artist) => {
          const isPlaying = currentTrackUri === artist.uri;
          const mainGenre = artist.genres?.[0] || "Artista";
          return (
            <GridItem
              key={artist.id}
              className={isPlaying ? "playing" : ""}
              onClick={() => setCurrentTrackUri(artist.uri)}
            >
              <RankBadge $rank={artist.rank}>
                <span className="rank-text">#{artist.rank}</span>
                <span className="play-hint">{isPlaying ? "♫" : "▶"}</span>
              </RankBadge>
              <CoverWrapper $round>
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  loading="lazy"
                />
              </CoverWrapper>
              <ItemDetails>
                <span className="item-title" title={artist.name}>
                  {artist.name}
                </span>
                <span
                  className="item-subtitle"
                  style={{ textTransform: "capitalize" }}
                >
                  {mainGenre}
                </span>
              </ItemDetails>
              {artist.popularity !== undefined && (
                <ItemMeta title="Popularidade no Spotify">
                  ★ {artist.popularity}
                </ItemMeta>
              )}
              <OpenInSpotify url={artist.external_urls?.spotify} name={artist.name} />
            </GridItem>
          );
        })}
      </GridContainer>
    </>
  );
};

export default TopArtists;

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  GridContainer,
  GridItem,
  RankBadge,
  CoverWrapper,
  ItemDetails,
  ItemMeta,
} from "../styles/LayoutStyle";
import { OpenInSpotify } from "./SpotifyBrand";

const TopAlbums = ({ token, currentTrackUri, setCurrentTrackUri, timeRange }) => {
  const [topAlbums, setTopAlbums] = useState([]);

  useEffect(() => {
    if (token) {
      axios
        .get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          // Pontua cada álbum pelas posições das suas faixas no seu top:
          // a #1 vale 50 pontos, a #50 vale 1. Álbuns com várias faixas bem
          // colocadas sobem; empates mantêm a ordem da faixa mais bem colocada.
          const tracks = response.data.items;
          const albumMap = new Map();
          tracks.forEach((track, index) => {
            const album = track.album;
            if (!albumMap.has(album.id)) {
              albumMap.set(album.id, { ...album, score: 0 });
            }
            albumMap.get(album.id).score += tracks.length - index;
          });
          const sortedAlbums = Array.from(albumMap.values()).sort(
            (a, b) => b.score - a.score
          );
          setTopAlbums(sortedAlbums);
        })
        .catch((error) => {
          console.error("Error fetching top albums:", error);
          if (error.response && error.response.status === 401) {
            window.localStorage.removeItem("token");
            window.location.reload();
          }
        });
    }
  }, [token, timeRange]);

  const ranked = topAlbums.slice(0, 30).map((album, index) => ({ ...album, rank: index + 1 }));

  return (
    <GridContainer>
      {ranked.map((album) => {
        const isPlaying = currentTrackUri === album.uri;
        const releaseYear = album.release_date
          ? album.release_date.split("-")[0]
          : "";
        return (
          <GridItem
            key={album.id}
            className={isPlaying ? "playing" : ""}
            onClick={() => setCurrentTrackUri(album.uri)}
          >
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
  );
};

export default TopAlbums;

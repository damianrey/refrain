import React from "react";
import { useArtworkColor } from "../utils/artworkColor";
import { HeroCard, HeroCover, HeroDetails, RowButton } from "../styles/LayoutStyle";
import { OpenInSpotify } from "./SpotifyBrand";

// Destaque do primeiro lugar, acima do restante do ranking
const TopHero = ({ imageUrl, title, subtitle, spotifyUrl, round, isPlaying, onPlay }) => {
  const color = useArtworkColor(imageUrl);

  return (
    <HeroCard
      className={isPlaying ? "playing" : ""}
      style={color ? { "--artwork-color": color } : undefined}
    >
      <RowButton
        type="button"
        title={title}
        aria-label={`Tocar ${title}`}
        aria-pressed={isPlaying}
        onClick={onPlay}
      />
      <HeroCover $round={round}>
        <img src={imageUrl} alt={title} />
      </HeroCover>
      <HeroDetails>
        <span className="hero-rank">{isPlaying ? "♫ Tocando" : "#1"}</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </HeroDetails>
      <OpenInSpotify url={spotifyUrl} name={title} />
    </HeroCard>
  );
};

export default TopHero;

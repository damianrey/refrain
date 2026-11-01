import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(11, 13, 16, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: #ffffff;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.35);

  @media (max-width: 768px) {
    padding: 0 16px;
    height: auto;
    min-height: 68px;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    border-radius: 10px;
    filter: drop-shadow(0 2px 8px rgba(29, 185, 84, 0.35));
    transition: transform 0.25s ease;
  }

  &:hover img {
    transform: rotate(-5deg) scale(1.05);
  }
`;

export const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #ffffff 0%, #1db954 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const MainContainer = styled.main`
  background-color: #0b0d10;
  background-image: radial-gradient(
    ellipse 75% 38% at 50% 0%,
    rgba(29, 185, 84, 0.14) 0%,
    rgba(11, 13, 16, 0) 100%
  );
  margin-top: 72px;
  padding: 32px 28px 140px;
  min-height: calc(100vh - 72px);

  @media (max-width: 768px) {
    margin-top: 110px;
    padding: 20px 14px 150px;
  }
`;

export const Tabs = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
`;

export const TabList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  padding: 5px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    justify-content: space-between;
    gap: 2px;
    box-sizing: border-box;
  }
`;

export const Tab = styled.button`
  background: transparent;
  border: none;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  color: #9ca3af;
  border-radius: 999px;
  white-space: nowrap;
  transition: all 0.22s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 8px 4px;
    font-size: 12.5px;
  }

  &.active {
    background: #1db954;
    color: #061109;
    font-weight: 700;
    box-shadow: 0 2px 12px rgba(29, 185, 84, 0.35);
  }
`;

export const TabPanel = styled.div`
  display: none;
  width: 100%;
  animation: ${fadeIn} 0.3s ease forwards;

  &.active {
    display: block;
  }
`;

export const ToolbarRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
`;

export const SectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h2 {
    margin: 0;
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: -0.4px;
    color: #f9fafb;
  }

  p {
    margin: 0;
    font-size: 0.88rem;
    color: #9ca3af;
  }
`;

export const PeriodTabs = styled.div`
  display: flex;
  justify-content: center;
`;

export const PeriodTabList = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #15181e;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  gap: 4px;
`;

export const PeriodTab = styled.button`
  background: transparent;
  border: none;
  padding: 7px 15px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: #f3f4f6;
    background: rgba(255, 255, 255, 0.04);
  }

  &.active {
    background: rgba(29, 185, 84, 0.16);
    color: #1ed760;
    font-weight: 700;
    box-shadow: inset 0 0 0 1px rgba(29, 185, 84, 0.35);
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 16px;
  width: 100%;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const GridItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(22, 25, 32, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 10px 14px;
  border-radius: 14px;
  color: #f3f4f6;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  &:hover {
    background: rgba(31, 36, 45, 0.95);
    border-color: rgba(29, 185, 84, 0.38);
    transform: translateY(-2px);
    box-shadow: 0 10px 24px -6px rgba(0, 0, 0, 0.5),
      0 0 16px rgba(29, 185, 84, 0.1);
  }

  @media (hover: hover) {
    &:hover .rank-text {
      display: none;
    }

    &:hover .play-hint {
      display: inline;
    }
  }

  &.playing {
    background: linear-gradient(
      90deg,
      rgba(29, 185, 84, 0.16) 0%,
      rgba(22, 25, 32, 0.9) 100%
    );
    border-color: #1db954;
    box-shadow: 0 0 20px rgba(29, 185, 84, 0.18);

    .rank-text {
      display: none;
    }

    .play-hint {
      display: inline;
    }
  }
`;

// Cobre a linha inteira para o clique, o teclado e os leitores de tela
export const RowButton = styled.button`
  position: absolute;
  inset: 0;
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 14px;
  cursor: pointer;

  &:focus-visible {
    outline-offset: -2px;
  }
`;

export const RankBadge = styled.span`
  min-width: 26px;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${(props) =>
    props.$rank === 1
      ? "#fbbf24"
      : props.$rank === 2
      ? "#cbd5e1"
      : props.$rank === 3
      ? "#d97706"
      : "#9ca3af"};
  text-align: center;
  font-variant-numeric: tabular-nums;

  .play-hint {
    display: none;
    color: #1ed760;
    font-size: 1rem;
  }
`;

export const CoverWrapper = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  /* O Spotify pede cantos de 8px em telas grandes e 4px nas demais */
  border-radius: ${(props) => (props.$round ? "50%" : "8px")};
  overflow: hidden;
  background: #1f242d;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 1080px) {
    border-radius: ${(props) => (props.$round ? "50%" : "4px")};
  }
`;

export const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;

  .item-title {
    font-size: 0.92rem;
    font-weight: 600;
    color: #f9fafb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-subtitle {
    font-size: 0.8rem;
    font-weight: 500;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Sem mouse não há tooltip: o nome completo precisa aparecer na própria linha */
  @media (hover: none) {
    .item-title,
    .item-subtitle {
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }
`;

export const ItemMeta = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
`;

export const WelcomeCard = styled.div`
  max-width: 520px;
  margin: 80px auto 0;
  padding: 42px 36px;
  text-align: center;
  background: rgba(22, 25, 32, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
  animation: ${fadeIn} 0.4s ease forwards;

  h1 {
    margin: 16px 0 10px;
    font-size: 1.75rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  p {
    margin: 0 0 24px;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #9ca3af;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  margin-bottom: 16px;
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(29, 185, 84, 0.16);
  border: 1px solid rgba(29, 185, 84, 0.45);
  color: #1ed760;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1db954;
    color: #061109;
    box-shadow: 0 2px 12px rgba(29, 185, 84, 0.35);
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

export const StatusMessage = styled.span`
  font-size: 0.82rem;
  font-weight: 500;
  color: ${(props) => (props.$error ? "#f87171" : "#9ca3af")};

  a {
    color: #1ed760;
    font-weight: 700;
  }
`;

export const ChartCard = styled.section`
  width: 100%;
  margin-bottom: 20px;
  padding: 18px 20px;
  background: rgba(22, 25, 32, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-sizing: border-box;

  h3 {
    margin: 0 0 4px;
    font-size: 1rem;
    font-weight: 700;
    color: #f9fafb;
  }

  > p {
    margin: 0 0 14px;
    font-size: 0.8rem;
    color: #9ca3af;
  }
`;

export const BarRow = styled.div`
  display: grid;
  grid-template-columns: minmax(90px, 180px) 1fr 84px;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  border-radius: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .bar-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #e5e7eb;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bar-value {
    font-size: 0.78rem;
    font-weight: 600;
    color: #9ca3af;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 680px) {
    grid-template-columns: minmax(80px, 120px) 1fr 72px;
    gap: 8px;
  }
`;

export const BarTrack = styled.div`
  height: 10px;
  border-radius: 0 4px 4px 0;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
`;

export const BarFill = styled.div`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: #1db954;
  border-radius: 0 4px 4px 0;
  transition: width 0.4s ease;
`;

export const OpenInSpotifyLink = styled.a`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const AttributionBar = styled.footer`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 28px;
  font-size: 0.8rem;
  color: #9ca3af;

  a {
    display: flex;
  }
`;

const skeletonPulse = keyframes`
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
`;

export const SkeletonItem = styled.div`
  height: 74px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: ${skeletonPulse} 1.6s ease-in-out infinite;
`;

export const StateMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 40px 20px;
  text-align: center;
  background: rgba(22, 25, 32, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;

  p {
    margin: 0;
    font-size: 0.92rem;
    color: #d1d5db;
  }
`;

export const HeroCard = styled.article`
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  margin-bottom: 16px;
  padding: 18px 20px;
  background: linear-gradient(
    110deg,
    var(--artwork-color, rgba(29, 185, 84, 0.16)) 0%,
    rgba(22, 25, 32, 0.9) 85%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  transition: border-color 0.22s ease;

  &:hover,
  &.playing {
    border-color: #1db954;
  }

  @media (max-width: 680px) {
    gap: 14px;
    padding: 14px;
  }
`;

export const HeroCover = styled.div`
  width: 132px;
  height: 132px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${(props) => (props.$round ? "50%" : "8px")};
  background: #1f242d;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 1080px) {
    border-radius: ${(props) => (props.$round ? "50%" : "4px")};
  }

  @media (max-width: 680px) {
    width: 92px;
    height: 92px;
  }
`;

export const HeroDetails = styled.div`
  flex: 1;
  min-width: 0;

  .hero-rank {
    font-size: 0.85rem;
    font-weight: 800;
    color: #fbbf24;
  }

  &:is(.playing *) .hero-rank {
    color: #1ed760;
  }

  h3 {
    margin: 4px 0 2px;
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.3px;
    color: #ffffff;
    overflow-wrap: anywhere;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    color: #d1d5db;
    overflow-wrap: anywhere;
  }

  @media (max-width: 680px) {
    h3 {
      font-size: 1.15rem;
    }

    p {
      font-size: 0.85rem;
    }
  }
`;

import styled from "styled-components";

export const PlayerWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: min(940px, calc(100vw - 32px));
  z-index: 1000;
  display: flex;
  align-items: center;
  background: linear-gradient(
      90deg,
      var(--artwork-color, transparent) 0%,
      transparent 75%
    ),
    rgba(18, 21, 27, 0.94);
  /* Sem isso o gradiente se repete sob a borda e inverte as cores das laterais */
  background-origin: border-box;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 6px 18px 6px 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7),
    0 0 25px rgba(29, 185, 84, 0.12);

  /* Ajustes internos do react-spotify-web-playback */
  .PlayerRSWP {
    flex: 1;
    min-width: 0;
    background: transparent !important;
  }

  /* Impede que o ícone de Devices quebre para uma segunda linha e expanda o player */
  [data-component-name="Wrapper"] {
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    min-height: 68px !important;
    padding: 0 !important;
  }

  [data-component-name="Info"] {
    width: 240px !important;
    min-width: 240px !important;
    max-width: 240px !important;
    min-height: 64px !important;
    flex: 0 0 240px !important;
  }

  [data-component-name="Controls"] {
    width: auto !important;
    flex: 1 1 auto !important;
    padding: 0 12px 24px 12px !important;
  }

  ._ControlsButtonsRSWP {
    margin-bottom: 0 !important;
  }

  [data-component-name="Actions"] {
    width: auto !important;
    flex: 0 0 auto !important;
    height: auto !important;
    position: static !important;
    padding: 0 6px !important;
  }

  /* Oculta as barras nativas lentas de volume e progresso da biblioteca */
  [data-component-name="Volume"],
  [data-component-name="Slider"] {
    display: none !important;
  }

  @media (max-width: 820px) {
    flex-direction: column;
    align-items: stretch;
    padding: 8px 12px;
    bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    width: calc(100vw - 16px);
    gap: 4px;
    border-radius: 14px;

    /* Layout compacto em linha: capa + título à esquerda, controles à direita */
    [data-component-name="Wrapper"] {
      flex-direction: row !important;
      min-height: 0 !important;
      gap: 8px;
      padding-right: 36px !important;
    }

    [data-component-name="Info"] {
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      min-height: 0 !important;
      flex: 1 1 auto !important;
      padding-left: 0 !important;
      border-bottom: none !important;

      /* A biblioteca reserva 64px para o link da capa, o que afastava o título */
      > a {
        min-width: 0 !important;
        min-height: 0 !important;
      }

      img {
        width: 44px !important;
        height: 44px !important;
        border-radius: 4px;
      }
    }

    ._ContentWrapperRSWP {
      min-height: 44px !important;
      width: calc(100% - 52px) !important;
    }

    [data-component-name="Controls"] {
      width: auto !important;
      flex: 0 0 auto !important;
      padding: 0 !important;
    }

    [data-component-name="Actions"] {
      padding: 0 !important;
    }

    .player-mini-progress {
      display: block;
    }

    /* Mini player: só capa, título e play. O restante aparece ao expandir */
    &[data-expanded="false"] {
      .player-extra,
      [data-component-name="Actions"],
      ._ControlsButtonsRSWP > div:not(:has(.rswp__toggle)) {
        display: none !important;
      }
    }

    /* Expandido: título em linha própria, para o nome caber, e controles abaixo */
    &[data-expanded="true"] {
      .player-mini-progress {
        display: none;
      }

      [data-component-name="Wrapper"] {
        flex-wrap: wrap !important;
        padding-right: 0 !important;
      }

      [data-component-name="Info"],
      [data-component-name="Controls"] {
        flex: 1 1 100% !important;
      }

      /* Reserva o espaço da seta só nesta linha, para centralizar os controles */
      [data-component-name="Info"] {
        padding-right: 36px !important;
      }

      /* Título à esquerda e logo à direita, na mesma linha da capa */
      ._ContentWrapperRSWP {
        flex-direction: row !important;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        > a {
          flex-shrink: 0;
          margin-top: 0;
        }
      }

      ._ContentRSWP {
        flex: 1 1 auto;
        min-width: 0;
      }
    }
  }
`;

export const PlayerToggle = styled.button`
  display: none;
  position: absolute;
  top: 13px;
  right: 6px;
  z-index: 30;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #d1d5db;
  cursor: pointer;

  svg {
    transition: transform 0.2s ease;
  }

  [data-expanded="true"] > & svg {
    transform: rotate(180deg);
  }

  /* Recolhido, centraliza com o botão de play */
  [data-expanded="false"] > & {
    top: 50%;
    transform: translateY(-50%);
  }

  @media (max-width: 820px) {
    display: flex;
  }
`;

export const MiniProgress = styled.div`
  display: none;
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 0;
  height: 2px;
  background: #1db954;
  transform-origin: left center;
`;

export const SeekBarContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 268px;
  right: 296px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 25;
  user-select: none;

  @media (max-width: 820px) {
    position: static;
    width: 100%;

    /* Tempos nas pontas, alinhados às bordas das demais linhas */
    span:first-child {
      text-align: left;
    }

    span:last-child {
      text-align: right;
    }
  }
`;

export const SeekTime = styled.span`
  min-width: 38px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
  text-align: ${(props) => (props.$alignRight ? "right" : "left")};
`;

export const SeekSlider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: ${(props) =>
    `linear-gradient(to right, #1db954 0%, #1ed760 ${props.$percent}%, rgba(255, 255, 255, 0.18) ${props.$percent}%, rgba(255, 255, 255, 0.18) 100%)`};
  outline: none;
  cursor: pointer;
  transition: height 0.15s ease;

  &:hover {
    height: 8px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #1db954;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    cursor: grab;
    transition: transform 0.12s ease, background-color 0.12s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    background: #1ed760;
  }

  &::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.25);
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #1db954;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    cursor: grab;
    transition: transform 0.12s ease;
  }
`;

export const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 14px;
  margin-left: 4px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  user-select: none;

  @media (max-width: 820px) {
    border-left: none;
    padding-left: 0;
    margin-left: 0;
    width: 100%;
    gap: 10px;

    /* Mesmas larguras da barra de progresso, para os dois sliders alinharem */
    & > button:first-child {
      justify-content: flex-start;
      width: 38px;
      padding: 0;
    }

    & > span {
      min-width: 38px;
    }

    /* No toque, o slider basta: oculta os botões −/+ para economizar espaço */
    & > button:not(:first-child) {
      display: none;
    }

    input[type="range"] {
      flex: 1;
      width: auto;
    }
  }
`;

export const VolumeIconButton = styled.button`
  background: transparent;
  border: none;
  color: ${(props) => (props.$muted ? "#ef4444" : "#d1d5db")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    color: ${(props) => (props.$muted ? "#f87171" : "#1ed760")};
    background: rgba(255, 255, 255, 0.06);
  }
`;

export const VolumeStepButton = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(29, 185, 84, 0.2);
    border-color: #1db954;
    color: #1ed760;
  }

  &:active {
    transform: scale(0.92);
  }
`;

export const VolumeSlider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 110px;
  height: 6px;
  border-radius: 999px;
  background: ${(props) =>
    `linear-gradient(to right, #1db954 0%, #1ed760 ${props.$percent}%, rgba(255, 255, 255, 0.18) ${props.$percent}%, rgba(255, 255, 255, 0.18) 100%)`};
  outline: none;
  cursor: pointer;
  transition: height 0.15s ease;

  &:hover {
    height: 8px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #1db954;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    cursor: grab;
    transition: transform 0.12s ease, background-color 0.12s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    background: #1ed760;
  }

  &::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.25);
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #1db954;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    cursor: grab;
    transition: transform 0.12s ease;
  }
`;

export const VolumePercentage = styled.span`
  min-width: 36px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #9ca3af;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const playerStyles = {
  activeColor: "#1db954",
  bgColor: "transparent",
  color: "#ffffff",
  loaderColor: "#1db954",
  sliderColor: "#1db954",
  sliderTrackColor: "rgba(255, 255, 255, 0.18)",
  sliderHandleColor: "#ffffff",
  sliderTrackBorderRadius: 999,
  trackArtistColor: "#9ca3af",
  trackNameColor: "#f9fafb",
  height: 68,
};

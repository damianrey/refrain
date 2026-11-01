import React, { useState } from "react";
import { PERIOD_LABELS } from "../config/spotifyConfig";
import { createShareCard, shareImage } from "../utils/shareCard";
import { ActionButton, StatusMessage } from "../styles/LayoutStyle";

const SHARE_COUNT = 5;

const ShareTopButton = ({ title, timeRange, items }) => {
  const [shareStatus, setShareStatus] = useState("idle");

  const handleShare = async () => {
    setShareStatus("loading");
    try {
      const blob = await createShareCard({
        title,
        period: PERIOD_LABELS[timeRange],
        items: items.slice(0, SHARE_COUNT),
      });
      setShareStatus(await shareImage(blob, "meu-top-5.png"));
    } catch (error) {
      console.error("Error creating share card:", error);
      setShareStatus("error");
    }
  };

  return (
    <>
      {shareStatus === "downloaded" && (
        <StatusMessage role="status">Imagem baixada!</StatusMessage>
      )}
      {shareStatus === "error" && (
        <StatusMessage $error role="alert">
          Não foi possível gerar a imagem. Tente novamente.
        </StatusMessage>
      )}
      <ActionButton
        type="button"
        onClick={handleShare}
        disabled={!items.length || shareStatus === "loading"}
      >
        {shareStatus === "loading" ? "Gerando imagem…" : "Compartilhar top 5"}
      </ActionButton>
    </>
  );
};

export default ShareTopButton;

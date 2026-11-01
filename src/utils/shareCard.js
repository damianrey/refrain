import { getArtworkColor, loadImage } from "./artworkColor";
import { LOGO_PATH } from "../components/SpotifyBrand";

// Formato vertical de stories
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const MARGIN = 80;
const COVER_SIZE = 200;
const ROW_HEIGHT = 250;
const ROWS_TOP = 410;
const TEXT_LEFT = MARGIN + 100 + COVER_SIZE + 40;
const LOGO_WIDTH = 288;
const FONT = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";

const roundedRectPath = (context, x, y, size, radius) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + size, y, x + size, y + size, radius);
  context.arcTo(x + size, y + size, x, y + size, radius);
  context.arcTo(x, y + size, x, y, radius);
  context.arcTo(x, y, x + size, y, radius);
  context.closePath();
};

const truncateLine = (context, text, maxWidth) => {
  if (context.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && context.measureText(`${text.slice(0, end)}…`).width > maxWidth) {
    end -= 1;
  }
  return `${text.slice(0, end).trimEnd()}…`;
};

// Quebra em até maxLines linhas; o que sobrar na última vira reticências
const wrapText = (context, text, maxWidth, maxLines) => {
  const lines = [];
  let remaining = text.split(" ");

  while (remaining.length && lines.length < maxLines - 1) {
    let count = 1;
    while (
      count < remaining.length &&
      context.measureText(remaining.slice(0, count + 1).join(" ")).width <= maxWidth
    ) {
      count += 1;
    }
    lines.push(truncateLine(context, remaining.slice(0, count).join(" "), maxWidth));
    remaining = remaining.slice(count);
  }

  if (remaining.length) {
    lines.push(truncateLine(context, remaining.join(" "), maxWidth));
  }
  return lines;
};

const drawCover = (context, image, x, y) => {
  context.save();
  roundedRectPath(context, x, y, COVER_SIZE, 8);
  context.clip();
  if (image) {
    context.drawImage(image, x, y, COVER_SIZE, COVER_SIZE);
  } else {
    context.fillStyle = "#1f242d";
    context.fillRect(x, y, COVER_SIZE, COVER_SIZE);
  }
  context.restore();
};

const drawRow = (context, item, image, index) => {
  const y = ROWS_TOP + index * ROW_HEIGHT;
  const textWidth = CARD_WIDTH - MARGIN - TEXT_LEFT;

  context.fillStyle = "#ffffff";
  context.font = `800 64px ${FONT}`;
  context.textBaseline = "middle";
  context.fillText(String(index + 1), MARGIN, y + COVER_SIZE / 2);

  drawCover(context, image, MARGIN + 100, y);

  context.font = `700 46px ${FONT}`;
  const titleLines = wrapText(context, item.name, textWidth, 2);
  const blockHeight = titleLines.length * 58 + 48;
  let textY = y + (COVER_SIZE - blockHeight) / 2 + 29;
  titleLines.forEach((line) => {
    context.fillText(line, TEXT_LEFT, textY);
    textY += 58;
  });

  context.fillStyle = "#c7ccd4";
  context.font = `500 36px ${FONT}`;
  context.fillText(
    truncateLine(context, item.subtitle, textWidth),
    TEXT_LEFT,
    textY - 6
  );
};

const drawAttribution = (context) => {
  const logoHeight = LOGO_WIDTH * (160 / 512);
  const y = CARD_HEIGHT - MARGIN - logoHeight;

  context.fillStyle = "#c7ccd4";
  context.font = `500 34px ${FONT}`;
  context.textBaseline = "middle";
  context.fillText("Dados fornecidos por", MARGIN, y + logoHeight / 2);
  const textWidth = context.measureText("Dados fornecidos por").width;

  context.save();
  context.translate(MARGIN + textWidth + 28, y);
  context.scale(LOGO_WIDTH / 512, LOGO_WIDTH / 512);
  context.fillStyle = "#ffffff";
  context.fill(new Path2D(LOGO_PATH));
  context.restore();
};

// Nenhum texto fica sobre as capas: as regras do Spotify não permitem
export const createShareCard = async ({ title, period, items }) => {
  const [images, color] = await Promise.all([
    Promise.all(items.map((item) => loadImage(item.imageUrl).catch(() => null))),
    getArtworkColor(items[0]?.imageUrl),
    document.fonts?.load(`800 96px ${FONT}`),
    document.fonts?.load(`500 36px ${FONT}`),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");

  const background = context.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  background.addColorStop(0, color || "#14361f");
  background.addColorStop(0.7, "#0b0d10");
  context.fillStyle = background;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.textBaseline = "alphabetic";
  context.fillStyle = "#ffffff";
  context.font = `800 84px ${FONT}`;
  wrapText(context, title, CARD_WIDTH - MARGIN * 2, 2).forEach((line, index) => {
    context.fillText(line, MARGIN, 170 + index * 96);
  });

  context.fillStyle = "#c7ccd4";
  context.font = `500 40px ${FONT}`;
  context.fillText(period, MARGIN, 352);

  items.forEach((item, index) => drawRow(context, item, images[index], index));
  drawAttribution(context);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem"))),
      "image/png"
    );
  });
};

const downloadFile = (file) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// No toque abre o compartilhamento do sistema; sem ele, ou no desktop, baixa o PNG
export const shareImage = async (blob, filename) => {
  const file = new File([blob], filename, { type: "image/png" });
  const isTouchDevice = window.matchMedia("(hover: none)").matches;

  if (isTouchDevice && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (error) {
      if (error.name === "AbortError") return "cancelled";
    }
  }

  downloadFile(file);
  return "downloaded";
};

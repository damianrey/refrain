import { useEffect, useState } from "react";

const SAMPLE_SIZE = 16;
// Teto de luminosidade e saturação: mantém o texto branco legível sobre a cor
const MAX_LIGHTNESS = 0.22;
const MAX_SATURATION = 0.55;

const colorCache = new Map();

// crossOrigin permite ler a imagem no canvas; o CDN do Spotify libera CORS
export const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Falha ao carregar ${url}`));
    image.src = url;
  });

const rgbToHsl = (r, g, b) => {
  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return [0, 0, lightness];

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === red) hue = ((green - blue) / delta + 6) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return [hue * 60, saturation, lightness];
};

// Média ponderada pela saturação, para os tons vivos da capa pesarem mais que o cinza
const extractColor = (image) => {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  let [red, green, blue, totalWeight] = [0, 0, 0, 0];
  for (let i = 0; i < data.length; i += 4) {
    const saturation = rgbToHsl(data[i], data[i + 1], data[i + 2])[1];
    const weight = 0.1 + saturation;
    red += data[i] * weight;
    green += data[i + 1] * weight;
    blue += data[i + 2] * weight;
    totalWeight += weight;
  }

  const [hue, saturation, lightness] = rgbToHsl(
    red / totalWeight,
    green / totalWeight,
    blue / totalWeight
  );
  const finalSaturation = Math.min(saturation, MAX_SATURATION) * 100;
  const finalLightness = Math.min(lightness, MAX_LIGHTNESS) * 100;
  return `hsl(${Math.round(hue)}, ${Math.round(finalSaturation)}%, ${Math.round(finalLightness)}%)`;
};

// Devolve null se a imagem falhar: quem usa mantém a cor padrão do tema
export const getArtworkColor = (url) => {
  if (!url) return Promise.resolve(null);
  if (!colorCache.has(url)) {
    colorCache.set(
      url,
      loadImage(url)
        .then(extractColor)
        .catch((error) => {
          console.error("Error reading artwork color:", error);
          return null;
        })
    );
  }
  return colorCache.get(url);
};

export const useArtworkColor = (url) => {
  const [color, setColor] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    getArtworkColor(url).then((nextColor) => {
      if (!isCancelled) setColor(nextColor);
    });
    return () => {
      isCancelled = true;
    };
  }, [url]);

  return color;
};

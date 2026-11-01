import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

const DEFAULT_CACHE_MS = 5 * 60 * 1000;
const DEFAULT_RETRY_AFTER_SECONDS = 5;
// Esperas mais longas que isso viram erro, para a tela não ficar presa carregando
const MAX_RETRY_AFTER_SECONDS = 30;

const responseCache = new Map();

const readCache = (key, cacheMs) => {
  const cached = responseCache.get(key);
  return cached && Date.now() - cached.time < cacheMs ? cached.data : null;
};

// Busca dados da API do Spotify e expõe o estado da requisição.
// Aceita várias URLs de uma vez, para listas paginadas: nesse caso, "data" é um array.
// A troca de token não refaz a busca: só a URL, a ativação ou o "retry".
const useSpotifyData = (
  url,
  token,
  { enabled = true, cacheMs = DEFAULT_CACHE_MS } = {}
) => {
  const key = [].concat(url).join("|");
  const [state, setState] = useState({ key, data: null, status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const urlRef = useRef(url);
  urlRef.current = url;
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const skipCacheRef = useRef(false);
  const hasToken = !!token;

  useEffect(() => {
    if (!hasToken || !enabled) return undefined;

    const cached = skipCacheRef.current ? null : readCache(key, cacheMs);
    skipCacheRef.current = false;
    if (cached) {
      setState({ key, data: cached, status: "success" });
      return undefined;
    }

    let isCancelled = false;
    let retryTimer = null;

    setState((previous) =>
      previous.key === key
        ? { ...previous, status: "loading" }
        : { key, data: null, status: "loading" }
    );

    const fetchUrl = (target) =>
      axios.get(target, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });

    const request = (canRetry) => {
      const current = urlRef.current;
      const pending = Array.isArray(current)
        ? Promise.all(current.map(fetchUrl)).then((responses) =>
            responses.map((response) => response.data)
          )
        : fetchUrl(current).then((response) => response.data);

      pending
        .then((data) => {
          responseCache.set(key, { data, time: Date.now() });
          if (!isCancelled) setState({ key, data, status: "success" });
        })
        .catch((error) => {
          if (isCancelled) return;
          const status = error.response?.status;
          if (status === 429 && canRetry) {
            const seconds =
              Number(error.response.headers?.["retry-after"]) ||
              DEFAULT_RETRY_AFTER_SECONDS;
            if (seconds <= MAX_RETRY_AFTER_SECONDS) {
              retryTimer = setTimeout(() => request(false), seconds * 1000);
              return;
            }
          }
          console.error(`Error fetching ${key}:`, error);
          if (status === 401) {
            // Sem o token, o Auth renova a sessão com o refresh_token ao recarregar
            window.localStorage.removeItem("token");
            window.location.reload();
            return;
          }
          setState((previous) => ({ ...previous, status: "error" }));
        });
    };

    request(true);

    return () => {
      isCancelled = true;
      clearTimeout(retryTimer);
    };
  }, [key, cacheMs, hasToken, enabled, attempt]);

  const retry = useCallback(() => {
    skipCacheRef.current = true;
    setAttempt((current) => current + 1);
  }, []);

  // Evita mostrar por um instante os dados da URL anterior
  if (state.key !== key) {
    const cached = readCache(key, cacheMs);
    return {
      data: cached,
      status: cached ? "success" : "loading",
      retry,
    };
  }

  return { data: state.data, status: state.status, retry };
};

export default useSpotifyData;

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

// Busca dados da API do Spotify e expõe o estado da requisição.
// A troca de token não refaz a busca: só a URL, a ativação ou o "retry".
const useSpotifyData = (url, token, enabled = true) => {
  const [state, setState] = useState({ url, data: null, status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const tokenRef = useRef(token);
  tokenRef.current = token;
  const hasToken = !!token;

  useEffect(() => {
    if (!hasToken || !enabled) return undefined;

    let isCancelled = false;
    setState((previous) =>
      previous.url === url
        ? { ...previous, status: "loading" }
        : { url, data: null, status: "loading" }
    );

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      })
      .then((response) => {
        if (!isCancelled) {
          setState({ url, data: response.data, status: "success" });
        }
      })
      .catch((error) => {
        console.error(`Error fetching ${url}:`, error);
        if (error.response && error.response.status === 401) {
          // Sem o token, o Auth renova a sessão com o refresh_token ao recarregar
          window.localStorage.removeItem("token");
          window.location.reload();
          return;
        }
        if (!isCancelled) {
          setState((previous) => ({ ...previous, status: "error" }));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [url, hasToken, enabled, attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  return { data: state.data, status: state.status, retry };
};

export default useSpotifyData;

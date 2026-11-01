import { CLIENT_ID, TOKEN_ENDPOINT, SCOPES } from "./spotifyConfig";

// Renova um minuto antes de vencer, para nenhuma chamada sair com token expirado
const EXPIRY_MARGIN_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

let refreshInFlight = null;

export const saveTokenData = (data) => {
  const storage = window.localStorage;
  storage.setItem("token", data.access_token);
  storage.setItem(
    "token_scope",
    data.scope || storage.getItem("token_scope") || SCOPES
  );
  storage.setItem("token_expires_at", String(Date.now() + data.expires_in * 1000));
  // O Spotify pode trocar o refresh_token a cada renovação
  if (data.refresh_token) {
    storage.setItem("refresh_token", data.refresh_token);
  }
};

export const clearTokenData = () => {
  ["token", "token_scope", "token_expires_at", "refresh_token"].forEach((key) =>
    window.localStorage.removeItem(key)
  );
};

export const canRefreshToken = () => !!window.localStorage.getItem("refresh_token");

export const isTokenExpiring = () => {
  const expiresAt = Number(window.localStorage.getItem("token_expires_at"));
  return !!expiresAt && Date.now() >= expiresAt - EXPIRY_MARGIN_MS;
};

// Devolve o novo access_token, ou null se não foi possível renovar
export const refreshAccessToken = () => {
  const refreshToken = window.localStorage.getItem("refresh_token");
  if (!refreshToken) return Promise.resolve(null);

  if (!refreshInFlight) {
    refreshInFlight = fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.access_token) {
          saveTokenData(data);
          return data.access_token;
        }
        // Outra aba pode ter renovado primeiro e invalidado o refresh_token antigo
        if (window.localStorage.getItem("refresh_token") !== refreshToken) {
          return window.localStorage.getItem("token");
        }
        console.error("Erro ao renovar o token:", data);
        if (res.status === 400 || res.status === 401) {
          clearTokenData();
        }
        return null;
      })
      .catch((err) => {
        // Falha de rede: mantém o refresh_token para tentar de novo depois
        console.error("Erro na renovação do token:", err);
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

// Mantém o token em dia enquanto o app está aberto. O evento de visibilidade
// cobre celulares, que suspendem os timers com a aba em segundo plano.
export const startTokenAutoRefresh = (onToken) => {
  const check = () => {
    if (isTokenExpiring()) {
      refreshAccessToken().then((newToken) => {
        if (newToken) onToken(newToken);
      });
      return;
    }
    const storedToken = window.localStorage.getItem("token");
    if (storedToken) onToken(storedToken);
  };

  check();
  const intervalId = setInterval(check, CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", check);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener("visibilitychange", check);
  };
};

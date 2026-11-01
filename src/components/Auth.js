import React, { useEffect, useRef } from "react";
import {
  CLIENT_ID,
  REDIRECT_URI,
  AUTH_ENDPOINT,
  TOKEN_ENDPOINT,
  RESPONSE_TYPE,
  SCOPES,
} from "../config/spotifyConfig";
import AuthButton from "../styles/AuthButton";

const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

// Tokens emitidos antes da inclusão de novos escopos precisam de um novo login.
// Roda na importação, antes da primeira renderização, para o botão já nascer como "Login".
const storedScopes = (window.localStorage.getItem("token_scope") || "").split(" ");
if (!SCOPES.split(" ").every((s) => storedScopes.includes(s))) {
  window.localStorage.removeItem("token");
}

const Auth = ({ setToken }) => {
  const isExchangingCode = useRef(false);

  useEffect(() => {
    // Redireciona de localhost para 127.0.0.1 para manter o mesmo domínio do REDIRECT_URI exigido pelo Spotify
    if (window.location.hostname === "localhost") {
      window.location.replace(
        window.location.href.replace("http://localhost", "http://127.0.0.1")
      );
      return;
    }

    const storedToken = window.localStorage.getItem("token");
    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
      setToken(storedToken);
      return;
    } else if (storedToken === "undefined" || storedToken === "null") {
      window.localStorage.removeItem("token");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !isExchangingCode.current) {
      isExchangingCode.current = true;
      const codeVerifier = window.localStorage.getItem("code_verifier");

      // Limpa o parâmetro ?code= da URL imediatamente
      window.history.replaceState({}, document.title, window.location.pathname);

      fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            window.localStorage.setItem("token", data.access_token);
            window.localStorage.setItem("token_scope", data.scope || SCOPES);
            window.localStorage.removeItem("code_verifier");
            setToken(data.access_token);
          } else {
            console.error("Erro ao obter access_token:", data);
          }
        })
        .catch((err) => {
          console.error("Erro na requisição de token:", err);
        });
    }
  }, [setToken]);

  const handleAuthButtonClick = async () => {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    window.localStorage.setItem("code_verifier", codeVerifier);

    const params = new URLSearchParams({
      response_type: RESPONSE_TYPE,
      client_id: CLIENT_ID,
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      redirect_uri: REDIRECT_URI,
    });

    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("token_scope");
    window.localStorage.removeItem("code_verifier");
    window.location.reload();
  };

  return (
    <div>
      {!window.localStorage.getItem("token") ? (
        <AuthButton onClick={handleAuthButtonClick}>Login</AuthButton>
      ) : (
        <AuthButton onClick={logout}>Logout</AuthButton>
      )}
    </div>
  );
};

export default Auth;

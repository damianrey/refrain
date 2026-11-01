# Refrain

**Refrain** é uma aplicação web interativa construída em React que permite aos usuários visualizar suas faixas, álbuns e artistas mais ouvidos no Spotify e reproduzir suas músicas diretamente pelo navegador.

🌐 **Acesse a aplicação online:** [https://spotify-tracker-topaz.vercel.app/](https://spotify-tracker-topaz.vercel.app/)

## Funcionalidades

- **Top Tracks:** Ranking das 30 músicas mais ouvidas com duração da faixa, destaque para o Top 3 e indicador visual da música em reprodução.
- **Top Albums:** Ranking dos álbuns mais presentes nas suas faixas mais ouvidas, com ano de lançamento.
- **Top Artists:** Ranking dos 30 artistas mais ouvidos, exibindo gênero principal e índice de popularidade.
- **Filtro por Período:** Alterne facilmente entre **Últimas 4 Semanas** (*Short Term*), **Últimos 6 Meses** (*Medium Term*) e **Todo o Período** (*Long Term*).
- **Player Integrado com Controles Customizados:**
  - Reprodução direta no navegador via **Spotify Web Playback SDK** (requer conta Spotify Premium).
  - **Seek Bar (Barra de Progresso) de resposta imediata:** Arraste em tempo real ou use o scroll do mouse (±5s) para avançar/retroceder a música.
  - **Controle de Volume de resposta imediata:** Arraste em tempo real, use os botões `−` / `+` (±5%), clique no ícone para silenciar (*Mute/Unmute*) ou role o scroll do mouse sobre o volume.
- **Autenticação Segura OAuth 2.0 com PKCE:** Compatível com as diretrizes atuais de segurança da API do Spotify (`response_type=code` sem exposição de `client_secret`).

## Tecnologias Utilizadas

- [React 18](https://react.dev/)
- [Styled Components](https://styled-components.com/)
- [Axios](https://axios-http.com/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk) (`react-spotify-web-playback`)

## Como Executar Localmente

### 1. Clone o repositório e instale as dependências

```bash
git clone https://github.com/damianrey/spotify-tracker.git
cd spotify-tracker
npm install
```

### 2. Configure o App no Spotify Developer Dashboard

1. Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) e crie um aplicativo (ou abra um existente).
2. Nas configurações do aplicativo (**Settings**), adicione a seguinte URL em **Redirect URIs**:
   ```text
   http://127.0.0.1:3001
   ```
3. Copie o seu **Client ID** e defina-o na variável de ambiente `REACT_APP_SPOTIFY_CLIENT_ID` (localmente, copie `.env.example` para `.env.local`; no Vercel, em *Settings > Environment Variables*).

### 3. Inicie o servidor de desenvolvimento

```bash
npm start
```

A aplicação será iniciada automaticamente em [http://127.0.0.1:3001](http://127.0.0.1:3001).

## Deploy (Vercel)

A aplicação está hospedada na Vercel em:
👉 **[https://spotify-tracker-topaz.vercel.app/](https://spotify-tracker-topaz.vercel.app/)**

O projeto detecta automaticamente a origem (`window.location.origin`) para o `REDIRECT_URI`. Para funcionar no domínio em produção, certifique-se de que `https://spotify-tracker-topaz.vercel.app` esteja adicionado na lista de **Redirect URIs** do aplicativo no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

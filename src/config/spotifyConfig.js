export const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
export const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || window.location.origin;
export const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
export const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
export const RESPONSE_TYPE = 'code';
export const PERIOD_LABELS = {
  short_term: 'Últimas 4 Semanas',
  medium_term: 'Últimos 6 Meses',
  long_term: 'Todo o Período',
};
export const SCOPES = 'user-top-read user-read-private user-read-email user-library-read user-library-modify user-read-playback-state user-modify-playback-state streaming user-read-recently-played playlist-modify-private';

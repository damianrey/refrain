export const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'ee449d080911419bb92acf2d6fa4387a';
export const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || window.location.origin;
export const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
export const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
export const RESPONSE_TYPE = 'code';
export const SCOPES = 'user-top-read user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state streaming user-read-recently-played playlist-modify-private';

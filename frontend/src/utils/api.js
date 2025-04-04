import axios from 'axios';

// Base API URL
const API_BASE_URL = '/api';

// API endpoints
export const API = {
  // Auth endpoints
  login: () => axios.get(`${API_BASE_URL}/login`),
  getToken: () => axios.get(`${API_BASE_URL}/token`),
  getUser: () => axios.get(`${API_BASE_URL}/user`),
  
  // Search endpoints
  searchTracks: (query) => axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`),
  getSimilarSongs: (trackId) => axios.get(`${API_BASE_URL}/similar-songs?track_id=${trackId}`),
  
  // User data endpoints
  getUserTopTracks: () => axios.get(`${API_BASE_URL}/user/top-tracks`),
  
  // Favorites endpoints
  getFavorites: () => axios.get(`${API_BASE_URL}/favorites`),
  addToFavorites: (trackId) => axios.post(`${API_BASE_URL}/favorites`, { track_id: trackId }),
  removeFromFavorites: (trackId) => axios.delete(`${API_BASE_URL}/favorites`, { data: { track_id: trackId } }),
  
  // Playlist endpoints
  createPlaylist: (name, trackIds) => axios.post(`${API_BASE_URL}/create-playlist`, { name, track_ids: trackIds })
};

// Error handling interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error);
      // Redirect to login page if needed
    }
    return Promise.reject(error);
  }
);

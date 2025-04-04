import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { Favorite as FavoriteIcon, PlaylistAdd as PlaylistAddIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import TrackCard from '../components/TrackCard';
import SpotifyPlayer from '../components/SpotifyPlayer';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import axios from 'axios';

const Favorites = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/favorites');
      const favoriteTracks = response.data.favorites.items.map(item => item.track);
      setFavorites(favoriteTracks);
      setError(null);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load your favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    setPlayingTrack(track);
  };

  const handleRemoveFromFavorites = async (trackId) => {
    try {
      await axios.delete('/api/favorites', { data: { track_id: trackId } });
      setFavorites(favorites.filter(track => track.id !== trackId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const handleOpenCreatePlaylist = () => {
    setCreatePlaylistOpen(true);
  };

  const handleCloseCreatePlaylist = () => {
    setCreatePlaylistOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Alert severity="info">
            Please log in to view your favorites.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FavoriteIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Your Favorites
          </Typography>
        </Box>
        
        {playingTrack && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Now Playing
            </Typography>
            <SpotifyPlayer track={playingTrack} />
          </Paper>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : favorites.length > 0 ? (
          <>
            <Grid container spacing={2}>
              {favorites.map((track) => (
                <Grid item xs={12} sm={6} md={4} key={track.id}>
                  <TrackCard 
                    track={track} 
                    onPlay={handlePlayTrack}
                    isFavorite={true}
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                  />
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<PlaylistAddIcon />}
                onClick={handleOpenCreatePlaylist}
                disabled={favorites.length === 0}
                size="large"
              >
                Create Playlist from Favorites
              </Button>
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body1" paragraph>
              Start exploring similar songs and add them to your favorites!
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              href="/"
            >
              Discover Songs
            </Button>
          </Paper>
        )}
      </Box>
      
      {createPlaylistOpen && (
        <CreatePlaylistModal 
          open={createPlaylistOpen} 
          onClose={handleCloseCreatePlaylist} 
          tracks={favorites}
        />
      )}
    </Container>
  );
};

export default Favorites;

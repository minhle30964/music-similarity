import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Divider, 
  CircularProgress,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { 
  Whatshot as WhatshotIcon, 
  History as HistoryIcon, 
  Recommend as RecommendIcon 
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import TrackCard from '../components/TrackCard';
import SpotifyPlayer from '../components/SpotifyPlayer';
import axios from 'axios';

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [topTracks, setTopTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [playingTrack, setPlayingTrack] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user's top tracks
      const topTracksResponse = await axios.get('/api/user/top-tracks');
      setTopTracks(topTracksResponse.data.items);
      
      // Fetch user's favorites
      const favoritesResponse = await axios.get('/api/favorites');
      const favoriteTracks = favoritesResponse.data.favorites.items.map(item => item.track);
      setFavorites(favoriteTracks);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load your personalized content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePlayTrack = (track) => {
    setPlayingTrack(track);
  };

  const isTrackInFavorites = (trackId) => {
    return favorites.some(track => track.id === trackId);
  };

  const handleAddToFavorites = (track) => {
    setFavorites([...favorites, track]);
  };

  const handleRemoveFromFavorites = (trackId) => {
    setFavorites(favorites.filter(track => track.id !== trackId));
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Alert severity="info">
            Please log in to access your dashboard.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {user ? `Welcome, ${user.display_name}!` : 'Your Dashboard'}
        </Typography>
        
        <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              variant="fullWidth"
            >
              <Tab 
                icon={<WhatshotIcon />} 
                label="Your Top Tracks" 
                id="tab-0" 
                aria-controls="tabpanel-0" 
              />
              <Tab 
                icon={<HistoryIcon />} 
                label="Favorites" 
                id="tab-1" 
                aria-controls="tabpanel-1" 
              />
            </Tabs>
          </Box>
          
          {/* Player section */}
          {playingTrack && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Now Playing
              </Typography>
              <SpotifyPlayer track={playingTrack} />
            </Box>
          )}
          
          {/* Tab content */}
          <Box
            role="tabpanel"
            hidden={tabValue !== 0}
            id="tabpanel-0"
            aria-labelledby="tab-0"
            sx={{ p: 3 }}
          >
            {tabValue === 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WhatshotIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Your Top Tracks
                  </Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                ) : topTracks.length > 0 ? (
                  <Grid container spacing={2}>
                    {topTracks.map((track) => (
                      <Grid item xs={12} sm={6} md={4} key={track.id}>
                        <TrackCard 
                          track={track} 
                          onPlay={handlePlayTrack}
                          isFavorite={isTrackInFavorites(track.id)}
                          onAddToFavorites={handleAddToFavorites}
                          onRemoveFromFavorites={handleRemoveFromFavorites}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ my: 2 }}>
                    You don't have any top tracks yet. Start listening to more music on Spotify!
                  </Alert>
                )}
              </>
            )}
          </Box>
          
          <Box
            role="tabpanel"
            hidden={tabValue !== 1}
            id="tabpanel-1"
            aria-labelledby="tab-1"
            sx={{ p: 3 }}
          >
            {tabValue === 1 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h2">
                    Your Favorites
                  </Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                ) : favorites.length > 0 ? (
                  <Grid container spacing={2}>
                    {favorites.map((track) => (
                      <Grid item xs={12} sm={6} md={4} key={track.id}>
                        <TrackCard 
                          track={track} 
                          onPlay={handlePlayTrack}
                          isFavorite={true}
                          onAddToFavorites={handleAddToFavorites}
                          onRemoveFromFavorites={handleRemoveFromFavorites}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ my: 2 }}>
                    You haven't saved any favorites yet. Start exploring similar songs to add some!
                  </Alert>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;

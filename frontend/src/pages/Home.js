import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  Paper, 
  Divider,
  Fade,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  QueueMusic as QueueMusicIcon, 
  Headphones as HeadphonesIcon,
  Album as AlbumIcon,
  Person as PersonIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import SearchBar from '../components/SearchBar';
import TrackCard from '../components/TrackCard';
import SpotifyPlayer from '../components/SpotifyPlayer';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const { isAuthenticated, login } = useContext(AuthContext);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [similarTracksCategories, setSimilarTracksCategories] = useState({
    artist: { name: '', tracks: [] },
    album: { name: '', tracks: [] },
    genre: { name: '', tracks: [] }
  });
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

  // Fetch user favorites if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/favorites');
      const favoriteTracks = response.data.favorites.items.map(item => item.track);
      setFavorites(favoriteTracks);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    setPlayingTrack(track);
    fetchSimilarTracks(track.id);
  };

  const fetchSimilarTracks = async (trackId) => {
    setLoading(true);
    setSimilarTracksCategories({
      artist: { name: '', tracks: [] },
      album: { name: '', tracks: [] },
      genre: { name: '', tracks: [] }
    });
    
    try {
      const response = await axios.get(`/api/similar-songs?track_id=${trackId}`);
      if (response.data.categories) {
        setSimilarTracksCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching similar tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTabIndex(newValue);
  };
  
  // Get current category based on active tab
  const getCurrentCategory = () => {
    // Map tab index to category name
    const categoryMap = {
      0: 'artist',  // First tab is artist's top tracks
      1: 'album',   // Second tab is album tracks
      2: 'genre'    // Third tab is genre tracks
    };
    return categoryMap[activeTabIndex] || 'artist';
  };
  
  // Get current tracks to display based on active tab
  const getCurrentTracks = () => {
    const category = getCurrentCategory();
    return similarTracksCategories[category]?.tracks || [];
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

  const handleOpenCreatePlaylist = () => {
    // Pass the current category's tracks to the modal
    setCreatePlaylistOpen(true);
  };

  const handleCloseCreatePlaylist = () => {
    setCreatePlaylistOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Fade in={true} timeout={1000}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1DB954 30%, #191414 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Song Similarity Finder
          </Typography>
        </Fade>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          Discover songs similar to your favorites based on artist top tracks and genre
        </Typography>
        
        <SearchBar onTrackSelect={handleTrackSelect} />
      </Box>
      
      {selectedTrack && (
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Now Playing
              </Typography>
              
              <SpotifyPlayer track={playingTrack} />
              
              <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
                <QueueMusicIcon sx={{ mr: 1 }} />
                Similar Songs
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Tabs for different categories */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs 
                      value={activeTabIndex} 
                      onChange={handleTabChange} 
                      variant="fullWidth"
                      aria-label="similar songs categories"
                    >
                      <Tab 
                        icon={<PersonIcon />} 
                        label={similarTracksCategories.artist.name || "Artist's Top Tracks"}
                        id="tab-0"
                        aria-controls="tabpanel-0"
                      />
                      <Tab 
                        icon={<AlbumIcon />} 
                        label={similarTracksCategories.album.name || "Album Tracks"}
                        id="tab-1"
                        aria-controls="tabpanel-1"
                        disabled={!similarTracksCategories.album.tracks.length}
                      />
                      <Tab 
                        icon={<MusicNoteIcon />} 
                        label={similarTracksCategories.genre.name || "Genre Tracks"}
                        id="tab-2"
                        aria-controls="tabpanel-2"
                        disabled={false} // Always enable the genre tab
                      />
                    </Tabs>
                  </Box>
                  
                  {/* Current tab content */}
                  <Box role="tabpanel" id={`tabpanel-${activeTabIndex}`} aria-labelledby={`tab-${activeTabIndex}`}>
                    {getCurrentTracks().length > 0 ? (
                      <Grid container spacing={2}>
                        {getCurrentTracks().map((track) => (
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
                      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                        No tracks found in this category. Try another tab or search for a different song.
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Create playlist button */}
                  {isAuthenticated && getCurrentTracks().length > 0 && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleOpenCreatePlaylist}
                        startIcon={<HeadphonesIcon />}
                        size="large"
                      >
                        Create Spotify Playlist
                      </Button>
                    </Box>
                  )}
                </>
              )}
              
              {!isAuthenticated && getCurrentTracks().length > 0 && (
                <Paper 
                  sx={{ 
                    p: 3, 
                    mt: 4, 
                    textAlign: 'center',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Want more features?
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Log in with your Spotify account to save favorites, create playlists, and get personalized recommendations.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={login}
                    size="large"
                  >
                    Log in with Spotify
                  </Button>
                </Paper>
              )}
            </Paper>
          </Box>
        </Fade>
      )}
      
      {!selectedTrack && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <HeadphonesIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Search for a song to get started
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Type a song name in the search bar above to discover similar tracks
          </Typography>
        </Box>
      )}
      
      {createPlaylistOpen && (
        <CreatePlaylistModal 
          open={createPlaylistOpen} 
          onClose={handleCloseCreatePlaylist} 
          tracks={getCurrentTracks()}
        />
      )}
    </Container>
  );
};

export default Home;

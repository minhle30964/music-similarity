import React, { useContext, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton, 
  Box, 
  Chip,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TrackCard = ({ track, onPlay, isFavorite, onAddToFavorites, onRemoveFromFavorites }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formatArtists = (artists) => {
    return artists.map(artist => artist.name).join(', ');
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await axios.delete('/api/favorites', { data: { track_id: track.id } });
        onRemoveFromFavorites(track.id);
        setSnackbar({
          open: true,
          message: 'Removed from favorites',
          severity: 'success'
        });
      } else {
        await axios.post('/api/favorites', { track_id: track.id });
        onAddToFavorites(track);
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbar({
        open: true,
        message: 'Error updating favorites',
        severity: 'error'
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://open.spotify.com/track/${track.id}`);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate popularity level
  const getPopularityLabel = (popularity) => {
    if (popularity >= 80) return 'Hot';
    if (popularity >= 60) return 'Popular';
    if (popularity >= 40) return 'Moderate';
    return 'Niche';
  };

  const getPopularityColor = (popularity) => {
    if (popularity >= 80) return 'error';
    if (popularity >= 60) return 'warning';
    if (popularity >= 40) return 'info';
    return 'default';
  };

  return (
    <>
      <Card 
        sx={{ 
          display: 'flex', 
          mb: 2,
          height: '100%',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => `0 8px 16px ${
              theme.palette.mode === 'dark' 
                ? 'rgba(0, 0, 0, 0.5)' 
                : 'rgba(0, 0, 0, 0.1)'
            }`
          }
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 100 }}
          image={track.album.images[0]?.url || '/placeholder.png'}
          alt={track.name}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
            <Typography component="div" variant="h6" noWrap title={track.name}>
              {track.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div" noWrap>
              {formatArtists(track.artists)}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {track.album.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label={`${getPopularityLabel(track.popularity)} ${track.popularity}%`}
                size="small"
                color={getPopularityColor(track.popularity)}
                sx={{ mr: 1 }}
              />
            </Box>
          </CardContent>
          
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Tooltip title="Play">
              <IconButton aria-label="play" onClick={() => onPlay(track)}>
                <PlayIcon />
              </IconButton>
            </Tooltip>
            
            {isAuthenticated && (
              <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <IconButton 
                  aria-label="toggle favorite" 
                  onClick={handleFavoriteToggle}
                  color={isFavorite ? "primary" : "default"}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Share">
              <IconButton aria-label="share" onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TrackCard;

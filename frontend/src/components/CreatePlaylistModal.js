import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';

const CreatePlaylistModal = ({ open, onClose, tracks }) => {
  const [playlistName, setPlaylistName] = useState('My Similar Songs Playlist');
  const [selectedTracks, setSelectedTracks] = useState(tracks.map(track => track.id));
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handlePlaylistNameChange = (e) => {
    setPlaylistName(e.target.value);
  };

  const handleTrackToggle = (trackId) => {
    const currentIndex = selectedTracks.indexOf(trackId);
    const newSelectedTracks = [...selectedTracks];

    if (currentIndex === -1) {
      newSelectedTracks.push(trackId);
    } else {
      newSelectedTracks.splice(currentIndex, 1);
    }

    setSelectedTracks(newSelectedTracks);
  };

  const handleCreatePlaylist = async () => {
    if (selectedTracks.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one track',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/create-playlist', {
        name: playlistName,
        track_ids: selectedTracks
      });

      setSnackbar({
        open: true,
        message: 'Playlist created successfully!',
        severity: 'success'
      });
      
      // Open the playlist in a new tab
      if (response.data.playlist && response.data.playlist.external_urls) {
        window.open(response.data.playlist.external_urls.spotify, '_blank');
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      setSnackbar({
        open: true,
        message: 'Error creating playlist. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatArtists = (artists) => {
    return artists.map(artist => artist.name).join(', ');
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Spotify Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Playlist Name"
            type="text"
            fullWidth
            variant="outlined"
            value={playlistName}
            onChange={handlePlaylistNameChange}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Select tracks to include ({selectedTracks.length} selected):
          </Typography>
          
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {tracks.map((track) => (
              <ListItem key={track.id} dense button onClick={() => handleTrackToggle(track.id)}>
                <ListItemAvatar>
                  <Avatar
                    alt={track.name}
                    src={track.album.images[0]?.url}
                    variant="rounded"
                  />
                </ListItemAvatar>
                <ListItemText 
                  primary={track.name} 
                  secondary={formatArtists(track.artists)}
                />
                <Checkbox
                  edge="end"
                  checked={selectedTracks.indexOf(track.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': `checkbox-list-label-${track.id}` }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCreatePlaylist} 
            color="primary"
            variant="contained"
            disabled={loading || selectedTracks.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Playlist'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
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

export default CreatePlaylistModal;

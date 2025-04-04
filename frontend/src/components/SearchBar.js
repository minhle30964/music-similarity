import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Box, 
  CircularProgress 
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';

const SearchBar = ({ onTrackSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchTracks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchTracks = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      setResults(response.data.tracks.items);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClearInput = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleTrackSelect = (track) => {
    onTrackSelect(track);
    setShowResults(false);
  };

  const formatArtists = (artists) => {
    return artists.map(artist => artist.name).join(', ');
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600, mx: 'auto' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for a song..."
        value={query}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                query && (
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearInput}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                )
              )}
            </InputAdornment>
          ),
          sx: { borderRadius: 28 }
        }}
        sx={{ mb: 2 }}
      />
      
      {showResults && results.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2
          }}
        >
          <List>
            {results.map((track) => (
              <ListItem
                key={track.id}
                button
                onClick={() => handleTrackSelect(track)}
                sx={{
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'light' 
                      ? 'rgba(0, 0, 0, 0.04)' 
                      : 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={track.album.images[0]?.url}
                    variant="rounded"
                    alt={track.name}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={track.name}
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatArtists(track.artists)} • {track.album.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;

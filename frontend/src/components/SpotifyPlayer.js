import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const SpotifyPlayer = ({ track }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [playerHtml, setPlayerHtml] = useState('');

  useEffect(() => {
    if (!track) return;

    // Use iframe for logged-in users, oEmbed for logged-out users
    if (isAuthenticated) {
      // Full iframe player for logged-in users
      const iframe = `<iframe src="https://open.spotify.com/embed/track/${track.id}" 
        width="100%" 
        height="352" 
        frameBorder="0" 
        allowtransparency="true" 
        allow="encrypted-media">
      </iframe>`;
      setPlayerHtml(iframe);
    } else {
      // Simple oEmbed player for logged-out users
      const iframe = `<iframe src="https://open.spotify.com/embed/track/${track.id}" 
        width="100%" 
        height="80" 
        frameBorder="0" 
        allowtransparency="true" 
        allow="encrypted-media">
      </iframe>`;
      setPlayerHtml(iframe);
    }
  }, [track, isAuthenticated]);

  if (!track) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Select a track to play
        </Typography>
      </Paper>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: playerHtml }} />
    </Box>
  );
};

export default SpotifyPlayer;

import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { GitHub as GitHubIcon, Code as CodeIcon } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' 
          ? theme.palette.grey[200] 
          : theme.palette.grey[900]
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Song Similarity Finder
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link 
              href="https://developer.spotify.com/documentation/web-api/" 
              target="_blank" 
              rel="noopener noreferrer"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <CodeIcon fontSize="small" />
              <Typography variant="body2">Spotify API</Typography>
            </Link>
            
            <Link 
              href="https://github.com/minhle30964/music-similarity" 
              target="_blank" 
              rel="noopener noreferrer"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <GitHubIcon fontSize="small" />
              <Typography variant="body2">GitHub</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

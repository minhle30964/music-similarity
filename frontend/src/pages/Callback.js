import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Paper } from '@mui/material';
import axios from 'axios';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      // The code parameter is automatically handled by the backend
      // We just need to wait for the backend to process it
      try {
        // Check if token was successfully obtained
        const response = await axios.get('/api/token');
        if (response.data.token) {
          // Redirect to dashboard on successful login
          navigate('/dashboard');
        } else {
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Error during authentication callback:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          {error ? (
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
          ) : (
            <>
              <CircularProgress sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Logging you in...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we complete the authentication process.
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Callback;

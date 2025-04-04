import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import Callback from './pages/Callback';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const { mode } = useContext(ThemeContext);

  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Box className="app-container" sx={{ 
          bgcolor: 'background.default', 
          color: 'text.primary',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Navbar />
          <Box className="content-container" sx={{ flex: 1, padding: { xs: 2, md: 3 } }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/callback" element={<Callback />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;

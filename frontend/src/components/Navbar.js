import React, { useContext } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  useMediaQuery, 
  useTheme, 
  Menu, 
  MenuItem, 
  Avatar 
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  MusicNote as MusicIcon,
  Favorite as FavoriteIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const { isAuthenticated, user, login, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky" 
      color="primary" 
      elevation={1}
      sx={{
        '& .MuiIconButton-root, & .MuiButton-root, & .MuiTypography-root': {
          color: mode === 'dark' ? '#1ED760' : 'inherit'
        }
      }}
    >
      <Toolbar>
        <RouterLink to="/" style={{ 
          textDecoration: 'none', 
          color: mode === 'dark' ? '#1ED760' : 'inherit', 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <MusicIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Song Similarity Finder
          </Typography>
        </RouterLink>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <IconButton onClick={toggleColorMode} color="inherit" aria-label="toggle dark mode">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >

              
              {isAuthenticated && (
                <>
                  <MenuItem 
                    component={RouterLink} 
                    to="/dashboard" 
                    onClick={handleMenuClose}
                    selected={location.pathname === '/dashboard'}
                  >
                    <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/favorites" 
                    onClick={handleMenuClose}
                    selected={location.pathname === '/favorites'}
                  >
                    <FavoriteIcon fontSize="small" sx={{ mr: 1 }} />
                    Favorites
                  </MenuItem>
                </>
              )}
              
              <MenuItem onClick={() => {
                handleMenuClose();
                isAuthenticated ? logout() : login();
              }}>
                {isAuthenticated ? 'Logout' : 'Login with Spotify'}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>

            
            {isAuthenticated && (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/dashboard"
                  sx={{ 
                    mx: 1,
                    fontWeight: location.pathname === '/dashboard' ? 'bold' : 'normal',
                    borderBottom: location.pathname === '/dashboard' ? '2px solid white' : 'none'
                  }}
                >
                  Dashboard
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/favorites"
                  sx={{ 
                    mx: 1,
                    fontWeight: location.pathname === '/favorites' ? 'bold' : 'normal',
                    borderBottom: location.pathname === '/favorites' ? '2px solid white' : 'none'
                  }}
                >
                  Favorites
                </Button>
              </>
            )}
            
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {user && user.images && user.images[0] && (
                  <Avatar 
                    src={user.images[0].url} 
                    alt={user.display_name}
                    sx={{ width: 30, height: 30, mr: 1 }}
                  />
                )}
                <Button 
                  color="inherit" 
                  onClick={logout}
                  variant="outlined"
                  sx={{ ml: 1 }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Button 
                color="inherit" 
                onClick={login}
                variant="outlined"
                sx={{ ml: 1 }}
              >
                Login with Spotify
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import ablogo from '../assets/images/ablogo.png';
import resume from '../assets/images/AlanBalcomResume.pdf'

function Header() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1c1d25' }}>
      <Container maxWidth="xl" center>
        <Toolbar disableGutters>
          <img 
          src={ablogo} 
          alt='Alan Logo' 
          class='logo'
          />

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem onClick={handleCloseNavMenu}>
                <ul>
                  <li><a href='#about-me' style={{ color: 'black', marginLeft: '-30px'}}>ABOUT ME</a></li>
                  <li><a href='#projects' style={{ color: 'black', marginLeft: '-30px'}}>PROJECTS</a></li>
                  <li><a href='#contact-me' style={{ color: 'black', marginLeft: '-30px'}}>CONTACT</a></li>
                  <li><a href={resume} download style={{ color: 'black', marginLeft: '-30px'}}>DOWNLOAD RESUME</a></li>
                </ul>
              </MenuItem>
            </Menu>
          </Box>

          <Box class='navList' style={{ display: 'flex', alignItems: 'center'}}>
            <ul class='navList' style={{ color: 'white', display: 'flex', fontSize: '1rem' }}>
              <li><a href='#about-me'>ABOUT ME</a></li>
              <li><a href='#projects' >PROJECTS</a></li>
              <li><a href='#contact-me' >CONTACT</a></li>
              <li><a href={resume} download>DOWNLOAD RESUME</a></li>
            </ul>
          </Box>
          
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
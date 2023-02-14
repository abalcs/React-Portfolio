import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import ablogo from './images/ablogo.png';
import style from './header.module.scss';

const drawerWidth = 240;

function Header(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} id='home' sx={{ textAlign: 'center', background: '#1c1d25', color: 'white', height: '100vh' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <img src={ablogo} alt='intials logo' style={{ height: '70px'}}/>
      </Typography>
      
      <List>
          <ListItem  disablePadding>
            <ListItemButton sx={{ display: 'flex', flexDirection: 'column' }}>
              <ListItemText><a href='#about-me'>ABOUT ME</a></ListItemText>
              <ListItemText><a href='#skills'>SKILLS</a></ListItemText>
              <ListItemText><a href='#projects'>PROJECTS</a></ListItemText>
              <ListItemText><a href='#contact-me'>CONTACT</a></ListItemText>
              <ListItemText><a href='https://drive.google.com/file/d/1vMwuzViwCIyJH5R4lav5Gwps2GCG8kg1/view?usp=share_link' target='_blank' rel='noreferrer'>VIEW RESUME</a></ListItemText>
            </ListItemButton>
          </ListItem>
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" style={{ background: '#1c1d25', padding: '10px 0' }} elevation={0}>
        <Toolbar style={{ height: '70px'}} className={`${style.toolbar}`}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            <img src={ablogo} alt='intials logo' className={`${style.logo}`}/>
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>

            <Button href='#about-me' sx={{ color: '#fff' }}>
              ABOUT ME
            </Button>
            <Button href='#skills' sx={{ color: '#fff' }}>
              SKILLS
            </Button>
            <Button href='#projects' sx={{ color: '#fff' }}>
              PROJECTS
            </Button>
            <Button href='#contact-me' sx={{ color: '#fff' }}>
              CONTACT
            </Button>
            <Button href='https://drive.google.com/file/d/1vMwuzViwCIyJH5R4lav5Gwps2GCG8kg1/view?usp=share_link' target='_blank' sx={{ color: '#fff' }}>
              RESUME
            </Button>

          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  );
}

export default Header;
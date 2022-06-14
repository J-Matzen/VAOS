import React from 'react';
import SideMenu from './components/SideMenu';
import { Box, Drawer, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Tabs from './components/Tabs.js';

const drawerWidth = 262;
const closedDrawerWidth = 24;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

function SubApp() {
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vmax' }}>
      <Box bgcolor="primary.main" sx={{ height: '100vmax', width: closedDrawerWidth }}>
        <IconButton
          color="secondary"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{ height: '100vh', ...(open && { display: 'none' }) }}
        >
          <ChevronRight sx={{ ml: "4px" }} />
        </IconButton>
      </Box>
      <Drawer
        PaperProps={{
          sx: {
            backgroundColor: 'primary.main',
            color: '#ffffff',
            overflowY: 'unset',
            boxShadow: '0 8px 30px 10px rgba(0,0,0,0.3)',
          }
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <SideMenu />
        {open &&
          <Box bgcolor='info.light' sx={{
            position: "absolute",
            left: "242px",
            top: "36px",
            borderRadius: '50%',
            width: 40,
            height: 40,
            boxShadow: 3,
            display: "flex",
            justifyContent: "center"
          }}>
            <IconButton color='secondary' onClick={handleDrawerClose} sx={{ borderRadius: '50%', boxSizing: 'border-box' }}>
              <ChevronLeft fontSize={"large"} />
            </IconButton>
          </Box>
        }
      </Drawer>
      <Main open={open} sx={{ p: 0 }}>
        <Tabs />
      </Main>
    </Box>
  );
}


export default SubApp;


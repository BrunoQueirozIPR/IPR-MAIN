import React, { useState, useContext, useEffect, useMemo } from "react";
import clsx from "clsx";
import { WebSocketInterface } from 'jssip';
import * as LucideIcons from "lucide-react";
import { Slider } from "@material-ui/core";
import { User } from 'lucide-react';


import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Avatar,
  FormControl,
  Badge,
  withStyles,
} from "@material-ui/core";

import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import DarkMode from "../components/DarkMode";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";

import logo from "../assets/images/logo.png";
import { socketConnection } from "../services/socket";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";
import UserLanguageSelector from "../components/UserLanguageSelector";

import ColorModeContext from "../layout/themeContext";
import Brightness2Icon from '@material-ui/icons/Brightness2';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import { getBackendUrl } from "../config";

const backendUrl = getBackendUrl();

const drawerWidth = 270;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.fancyBackground,
    '& .MuiButton-outlinedPrimary': {
      color: theme.mode === 'light' ? '#065183' : '#FFF',
      border: theme.mode === 'light' ? '1px solid rgba(0 124 102)' : '1px solid rgba(255, 255, 255, 0.5)',
    },
    '& .MuiTab-textColorPrimary.Mui-selected': {
      color: theme.mode === 'light' ? '#065183' : '#FFF',
    }
  },
  avatar: {
    width: "100%",
  },
  toolbar: {
    paddingRight: 24, 
    color: theme.palette.dark.main,
    background: theme.palette.barraSuperior,
    borderTopLeftRadius: '40px',
  },  
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "fit",
    padding: "0px 10px",
    paddingLeft: "20px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      height: "48px"
    }
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    borderRadius: '20px',
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    fontSize: 14,
    fontWeight:300,
    color: "#cbd5e1",
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  containerWithScroll: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  NotificationsPopOver: {
    
  },
  logo: {
    width: "100%",
    height: "48px",
    maxWidth: 180,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      height: "100%",
      maxWidth: 180,
    },
    logo: theme.logo
  },
  avatar2: {
    color:'#64748b',
    width: theme.spacing(3),
    height: theme.spacing(3),
    cursor: 'pointer',
    borderRadius: '50%',
    marginRight:'30px',
  },
  updateDiv: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeSlider: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: theme.palette.background.paper,
    padding: '1rem',
    borderRadius: '4px',
    zIndex: 1000,
    width: '200px',
  },
}));

const handleSearch = (event) => {
  const query = event.target.value;
  console.log("Pesquisando:", query);
};


const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: '#44b700',
    color: '#44b700',
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}))(Badge);

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 22,
    height: 22,
  },
}))(Avatar);

const LoggedInLayout = ({ children, themeToggle }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);
  const [volume, setVolume] = useState(50);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  const mainListItems = useMemo(() => <MainListItems drawerOpen={drawerOpen}  collapsed={!drawerOpen} />, [user, drawerOpen])

  const config = {
    domain: '192.168.2.4', 
    uri: 'sip:202@192.168.2.4', 
    password: 'btelefonia12',
    ws_servers: 'wss://202@192.168.2.4:8089/ws',
    sockets: new WebSocketInterface('wss://192.168.2.4:8089/ws'),
    display_name: '202',
    websocket_url: 'wss://192.168.2.4:443',
    sip_outbound_ur: 'udp://192.168.2.4:5060',
    debug: true 
  };

  const setConnectOnStartToLocalStorage = (newValue) => {
    return true
  }
  const setNotifications = (newValue) => {
    return true
  }
  const setCallVolume = (newValue) => {
    return true
  }
  const setRingVolume = (newValue) => {
    return true
  }

  useEffect(() => {
    if (document.body.offsetWidth > 600) {
      if (user.defaultMenu === "closed") {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      toggleColorMode();
    }
  }, [user]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;

    const socket = socketConnection({ companyId, userId: user.id });
    const ImageUrl = user.profileImage;
    if (ImageUrl !== undefined && ImageUrl !== null)
      setProfileUrl(`${backendUrl}/public/company${companyId}/user/${ImageUrl}`);
    else 
      setProfileUrl(`${process.env.FRONTEND_URL}/nopicture.png`)

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    if (theme.mode === "dark") toggleColorMode();
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  }

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  }

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    setCallVolume(newValue / 100);
    setRingVolume(newValue / 100);
  };

  const handleVolumeClick = () => {
    setIsVolumeOpen(!isVolumeOpen);
  };

  // Click outside volume slider handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVolumeOpen && !event.target.closest('.volume-control')) {
        setIsVolumeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVolumeOpen]);

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <img src={logo} style={{ display: "block", margin: "0 auto", height: "50px", width: "100%" }} alt="logo" />
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <List className={classes.containerWithScroll}>
          {mainListItems}
        </List>
        <Divider />
      </Drawer>

      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            variant="contained"
            aria-label="open drawer"
            style={{padding: '22px', color: "light-gray" }}
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(
              classes.menuButton, drawerOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {greaterThenSm && user?.profile === "admin" && user?.company?.dueDate ? (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>, {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b>! ({i18n.t("mainDrawer.appBar.user.active")} {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>, {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>
          
          {/* DESABILITADO POIS TEM BUGS */}
          <UserLanguageSelector/>
          {/* <SoftPhone
            callVolume={33} //Set Default callVolume
            ringVolume={44} //Set Default ringVolume
            connectOnStart={false} //Auto connect to sip
            notifications={false} //Show Browser Notification of an incoming call
            config={config} //Voip config
            setConnectOnStartToLocalStorage={setConnectOnStartToLocalStorage} // Callback function
            setNotifications={setNotifications} // Callback function
            setCallVolume={setCallVolume} // Callback function
            setRingVolume={setRingVolume} // Callback function
            timelocale={'UTC-3'} //Set time local for call history
          // */}
          
          
          <IconButton edge="start" onClick={toggleColorMode} style={{ transform: "scale(0.8)" }}>
            {theme.mode === 'dark' ? (
              <LucideIcons.Moon style={{ color: "#64748b", transform: "scale(0.9)" }} /> // Reduzindo com escala
            ) : (
              <LucideIcons.Sun style={{ color: "#64748b", transform: "scale(0.9)" }} />
            )}
          </IconButton>

          {/* Volume Control */}
          <div className="volume-control" style={{ position: 'relative' }}>
            <IconButton
              onClick={handleVolumeClick}
              aria-label="Volume Control"
              style={{ color: "white", transform: "scale(0.9)" }}
            >
              {volume === 0 ? (
                <LucideIcons.VolumeX style={{ color: "#64748b", transform: "scale(0.8)"  }} />
              ) : volume < 50 ? (
                <LucideIcons.Volume1 style={{ color: "#64748b",  transform: "scale(0.8)" }} />
              ) : (
                <LucideIcons.Volume2 style={{ color: "#64748b", transform: "scale(0.8)"  }} />
              )}  
            </IconButton>
            
            {isVolumeOpen && (
              <div className={classes.volumeSlider} style={{ backgroundColor: "#576784" }}>
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                aria-labelledby="volume-slider"
                style={{
                  color: "white",
                  background: "#576784",
                }}
              />
              </div>
            )}
          </div>

          <IconButton
            onClick={handleRefreshPage}
            aria-label={i18n.t("mainDrawer.appBar.refresh")}
            color="inherit"
          >
            <LucideIcons.RefreshCcw style={{ color: "#64748b", transform: "scale(0.8)" }} />
          </IconButton>

          {user.id && <NotificationsPopOver />}

          <AnnouncementsPopover />

          <ChatPopover />

          <div>
          <StyledBadge
            overlap="none"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            variant="dot"
            onClick={handleMenu}
            style={{ backgroundColor: 'transparent' }} // Remover o fundo branco
          >
            <User className={classes.avatar2} style={{ color: "#64748b", transform: "scale(0.8)" }} />
          </StyledBadge>


            <UserModal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
              userId={user?.id}
            />

            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={menuOpen}
                onClose={handleCloseMenu}
                PaperProps={{
                    style: { backgroundColor:"#576784" }, // Adicionando fundo rosa ao menu
                }}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>
          </div>

        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Tooltip, IconButton, Divider, CircularProgress, Paper, useTheme, useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupIcon from '@mui/icons-material/Group';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CategoryIcon from '@mui/icons-material/Category';
import StorefrontIcon from '@mui/icons-material/Storefront';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import api from '../api';
import { AppContext } from '../contexts/AppContext';
import MenuIcon from '@mui/icons-material/Menu';

const menuItems = [
    { 
        text: 'Ana Sayfa', 
        icon: <DashboardIcon />, 
        path: '/panel',
        description: 'Genel bakış ve istatistikler'
    },
    { 
        text: 'Stok Yönetimi', 
        icon: <InventoryIcon />, 
        path: '/panel/products',
        description: 'Ürün ve stok işlemleri',
        subItems: [
            { text: 'Ürünler', icon: <InventoryIcon />, path: '/panel/products' },
            { text: 'Kategoriler', icon: <CategoryIcon />, path: '/panel/categories' },
            { text: 'Markalar', icon: <StorefrontIcon />, path: '/panel/brands' }
        ]
    },
    { 
        text: 'Cari Hesaplar', 
        icon: <AccountBalanceIcon />, 
        path: '/panel/cari',
        description: 'Müşteri ve tedarikçi yönetimi',
        subItems: [
            { text: 'Tüm Cari Hesaplar', icon: <AccountBalanceIcon />, path: '/panel/cari' },
            { text: 'Müşteriler', icon: <PeopleIcon />, path: '/panel/customers' },
            { text: 'Tedarikçiler', icon: <LocalShippingIcon />, path: '/panel/suppliers' }
        ]
    },
    { 
        text: 'Fatura İşlemleri', 
        icon: <ReceiptIcon />, 
        path: '/panel/invoices',
        description: 'Satış ve alış faturaları'
    },
    { 
        text: 'Mali İşler', 
        icon: <AccountBalanceWalletIcon />, 
        path: '/panel/account',
        description: 'Hesap ve finansal işlemler',
        subItems: [
            { text: 'Hesap Özeti', icon: <AccountBalanceWalletIcon />, path: '/panel/account' },
            { text: 'Raporlar', icon: <AssessmentIcon />, path: '/panel/reports' }
        ]
    },
    { 
        text: 'İnsan Kaynakları', 
        icon: <GroupIcon />, 
        path: '/panel/personnel',
        description: 'Personel yönetimi'
    }
];

const drawerWidth = 240;

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, notifications, setUser, setNotifications } = useContext(AppContext);
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [notifAnchor, setNotifAnchor] = useState(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate, setUser, setNotifications]);

    const fetchNotifications = useCallback(async () => {
        try {
            // Trigger due date reminders
            await api.get('/invoices/due-soon');
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

            } catch (error) {
                console.error("Failed to fetch initial data", error);
                handleLogout();
            }
        };
        fetchInitialData();

        // Fetch notifications periodically
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);

    }, [handleLogout, fetchNotifications, setUser]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    
    if (!user) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}><CircularProgress /></Box>;
    }

    const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
    const handleNotifClose = () => setNotifAnchor(null);
    const handleNotifRead = async (id) => {
        await api.put(`/notifications/${id}`);
        fetchNotifications();
    };

    const handleNotifClick = async (notif) => {
        await handleNotifRead(notif._id);
        handleNotifClose();
        if (notif.type === 'critical_stock') {
            navigate(`/panel/products/${notif.relatedId}`);
        } else if (notif.type === 'credit_limit') {
            navigate(`/panel/customers/${notif.relatedId}`);
        } else if (notif.type === 'due_date') {
            navigate(`/panel/invoices/${notif.relatedId}`);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all notifications as read", error.response?.data || error);
        }
    };
    const handleDeleteAll = async () => {
        await api.delete('/notifications/delete-all');
        fetchNotifications();
    };

    const drawerContent = (
        <>
            <Toolbar sx={{ 
                minHeight: isMobile ? 48 : 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center',
                    fontSize: isMobile ? '1.1rem' : '1.3rem'
                }}>
                    Stok Takip Pro
                </Typography>
            </Toolbar>
            <Divider />
            <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <List sx={{ flexGrow: 1, p: isMobile ? 0.5 : 1 }}>
                    {menuItems.map((item) => (
                        <React.Fragment key={item.text}>
                            <Tooltip title={item.description || item.text} placement="right" arrow>
                                <ListItem disablePadding component={Link} to={item.path}>
                                    <ListItemButton selected={
                                        location.pathname === item.path || 
                                        (item.subItems && item.subItems.some(subItem => location.pathname === subItem.path))
                                    } sx={{
                                        borderRadius: '12px',
                                        mb: isMobile ? 0.5 : 1,
                                        color: 'text.primary',
                                        minHeight: isMobile ? 40 : 52,
                                        '& .MuiListItemIcon-root': {
                                            color: 'inherit',
                                            minWidth: isMobile ? 36 : 44,
                                        },
                                        '& .MuiListItemText-primary': {
                                            fontSize: isMobile ? 14 : 16,
                                            fontWeight: 500,
                                        },
                                        '&.Mui-selected': {
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                            }
                                        },
                                        '&:hover': {
                                            background: 'rgba(102, 126, 234, 0.08)',
                                            transform: 'translateX(4px)',
                                            transition: 'all 0.2s ease-in-out',
                                        }
                                    }}>
                                        <ListItemIcon sx={{ minWidth: isMobile ? 36 : 44 }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItemButton>
                                </ListItem>
                            </Tooltip>
                            {item.subItems && (
                                <List component="div" disablePadding sx={{ ml: 1, mb: 1 }}>
                                    {item.subItems.map((subItem) => (
                                        <ListItem key={subItem.text} disablePadding component={Link} to={subItem.path} sx={{ pl: isMobile ? 2 : 3 }}>
                                            <ListItemButton selected={location.pathname === subItem.path} sx={{
                                                borderRadius: '8px',
                                                mb: isMobile ? 0.25 : 0.5,
                                                color: 'text.secondary',
                                                minHeight: isMobile ? 36 : 40,
                                                '& .MuiListItemIcon-root': {
                                                    color: 'inherit',
                                                    minWidth: isMobile ? 28 : 32,
                                                },
                                                '& .MuiListItemText-primary': {
                                                    fontSize: isMobile ? 13 : 14,
                                                    fontWeight: 400,
                                                },
                                                '&.Mui-selected': {
                                                    background: 'rgba(102, 126, 234, 0.15)',
                                                    color: '#667eea',
                                                    fontWeight: 500,
                                                    '&:hover': {
                                                        background: 'rgba(102, 126, 234, 0.25)',
                                                    }
                                                },
                                                '&:hover': {
                                                    background: 'rgba(0, 0, 0, 0.04)',
                                                    transform: 'translateX(2px)',
                                                    transition: 'all 0.2s ease-in-out',
                                                }
                                            }}>
                                                <ListItemIcon sx={{ minWidth: isMobile ? 28 : 32 }}>{subItem.icon}</ListItemIcon>
                                                <ListItemText primary={subItem.text} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            {item.subItems && <Divider sx={{ my: 1, opacity: 0.3 }} />}
                        </React.Fragment>
                    ))}
                </List>
                
                {/* Alt kısım - Ayarlar ve Çıkış */}
                <Divider />
                <Box sx={{ p: isMobile ? 0.5 : 1 }}>
                    <List>
                        <Tooltip title="Sistem ayarları ve yapılandırma" placement="right" arrow>
                            <ListItem disablePadding component={Link} to="/panel/settings">
                                <ListItemButton selected={location.pathname === '/panel/settings'} sx={{
                                    borderRadius: '12px',
                                    mb: 0.5,
                                    color: 'text.primary',
                                    minHeight: isMobile ? 40 : 48,
                                    '& .MuiListItemIcon-root': {
                                        color: 'inherit',
                                        minWidth: isMobile ? 36 : 40,
                                    },
                                    '& .MuiListItemText-primary': {
                                        fontSize: isMobile ? 14 : 16,
                                        fontWeight: 500,
                                    },
                                    '&.Mui-selected': {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    },
                                    '&:hover': {
                                        background: 'rgba(102, 126, 234, 0.08)',
                                    }
                                }}>
                                    <ListItemIcon sx={{ minWidth: isMobile ? 36 : 40 }}>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Ayarlar" />
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                        
                        <Tooltip title="Sistemden çıkış yap" placement="right" arrow>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleLogout} sx={{
                                    borderRadius: '12px',
                                    color: 'text.primary',
                                    minHeight: isMobile ? 40 : 48,
                                    '& .MuiListItemIcon-root': {
                                        color: 'inherit',
                                        minWidth: isMobile ? 36 : 40,
                                    },
                                    '& .MuiListItemText-primary': {
                                        fontSize: isMobile ? 14 : 16,
                                        fontWeight: 500,
                                    },
                                    '&:hover': {
                                        background: 'rgba(244, 67, 54, 0.08)',
                                        color: 'error.main',
                                    }
                                }}>
                                    <ListItemIcon sx={{ minWidth: isMobile ? 36 : 40 }}>
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Çıkış" />
                                </ListItemButton>
                            </ListItem>
                        </Tooltip>
                    </List>
                </Box>
            </Box>
        </>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <AppBar 
                position="fixed" 
                elevation={0}
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'text.primary',
                    minHeight: isMobile ? 48 : 64,
                    px: isMobile ? 1 : 3
                }}
            >
                <Toolbar sx={{ minHeight: isMobile ? 48 : 64, px: isMobile ? 1 : 3 }}>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 1 }}
                        >
                            <MenuIcon sx={{ fontSize: isMobile ? 22 : 28 }} />
                        </IconButton>
                    )}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1, fontSize: isMobile ? 16 : 22 }}>
                        {user.company.name}
                    </Typography>
                    <IconButton color="inherit" onClick={handleNotifOpen} sx={{ mr: isMobile ? 1 : 2 }}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon sx={{ fontSize: isMobile ? 20 : 28 }} />
                        </Badge>
                    </IconButton>
                    <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose} sx={{ minWidth: isMobile ? 220 : 320 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontSize: isMobile ? 13 : 16 }}>Bildirimler</Typography>
                            <Box>
                                <Tooltip title="Tümünü Okundu Yap"><IconButton size="small" onClick={handleMarkAllRead}><span role="img" aria-label="okundu">✔️</span></IconButton></Tooltip>
                                <Tooltip title="Tümünü Sil"><IconButton size="small" onClick={handleDeleteAll}><span role="img" aria-label="sil">🗑️</span></IconButton></Tooltip>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        {notifications.length === 0 && <MenuItem disabled>Bildirim yok</MenuItem>}
                        {notifications.map(n => (
                            <MenuItem key={n._id} onClick={() => handleNotifClick(n)} selected={!n.read} sx={{ whiteSpace: 'normal', fontWeight: n.read ? 400 : 700, bgcolor: !n.read ? 'rgba(102,126,234,0.08)' : 'inherit', fontSize: isMobile ? 13 : 15 }}>
                                {n.message}
                            </MenuItem>
                        ))}
                    </Menu>
                    <Typography sx={{ mr: isMobile ? 1 : 2, fontSize: isMobile ? 13 : 16 }}>{`Hoşgeldin, ${user.name}`}</Typography>
                    <Tooltip title="Çıkış Yap">
                        <IconButton onClick={handleLogout} color="inherit" sx={{ fontSize: isMobile ? 18 : 24 }}>
                            <LogoutIcon sx={{ fontSize: isMobile ? 20 : 28 }} />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { 
                            width: drawerWidth, 
                            boxSizing: 'border-box',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            elevation: 0,
                            minWidth: isMobile ? 180 : 240,
                            px: isMobile ? 0.5 : 2
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: isMobile ? 1 : 3, 
                    mt: isMobile ? '48px' : '64px',
                    width: { sm: `calc(100% - ${drawerWidth}px)` }
                }}
            >
              <Paper elevation={0} sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: isMobile ? '8px' : '15px',
                  p: isMobile ? 1 : 3,
                  width: '100%',
                  minHeight: isMobile ? 'calc(100vh - 48px - 32px)' : 'calc(100vh - 64px - 48px)'
              }}>
                <Outlet />
              </Paper>
            </Box>
        </Box>
    );
}

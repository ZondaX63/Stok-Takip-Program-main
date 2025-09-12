import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
    Paper, IconButton, InputAdornment, CircularProgress, Alert, FormControl, InputLabel, 
    Select, MenuItem, Grid, Card, CardContent, Avatar, Chip, Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import { Add, Edit, Delete, Search, Person, AdminPanelSettings, Email, Phone } from '@mui/icons-material';
import api from '../api';
import Toast from '../components/Toast';
import { AppBox, AppTitle } from '../components/Styled';

export default function PersonnelPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [search, setSearch] = useState('');
    const [editPersonnel, setEditPersonnel] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/company-users');
            setUsers(res.data);
        } catch {
            setToast({ open: true, message: 'Personel listesi alınamadı', severity: 'error' });
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleOpen = (user = null) => {
        if (user) {
            setForm({ name: user.name, email: user.email, password: '', role: user.role });
            setEditPersonnel(user);
        } else {
            setForm({ name: '', email: '', password: '', role: 'user' });
            setEditPersonnel(null);
        }
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSavePersonnel = async () => {
        if (!form.name || !form.email || !form.password) {
            setToast({ open: true, message: 'Lütfen tüm alanları doldurun.', severity: 'warning' });
            return;
        }

        setLoading(true);
        try {
            if (editPersonnel) {
                await api.put(`/auth/company-users/${editPersonnel._id}`, form);
                setToast({ open: true, message: 'Personel güncellendi.', severity: 'success' });
            } else {
                await api.post('/auth/company-users', form);
                setToast({ open: true, message: 'Personel eklendi.', severity: 'success' });
            }
            fetchUsers();
            handleClose();
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.map(e => e.msg).join(', ') || err.response?.data?.msg || 'İşlem başarısız';
            setToast({ open: true, message: errorMsg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/auth/user/${id}`);
            setToast({ open: true, message: 'Personel silindi', severity: 'success' });
            fetchUsers();
        } catch (err) {
            setToast({ open: true, message: 'Silme işlemi başarısız', severity: 'error' });
        }
    };

    const filtered = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleColor = (role) => {
        return role === 'admin' ? 'error' : 'primary';
    };

    const getRoleIcon = (role) => {
        return role === 'admin' ? <AdminPanelSettings /> : <Person />;
    };

    return (
        <AppBox elevation={10}>
            <AppTitle variant="h4">Personel Yönetimi</AppTitle>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    placeholder="Personel Ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                    size="small"
                    sx={{ minWidth: 250 }}
                />
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpen()}
                    sx={{ fontSize: 16, px: 3, py: 1.5 }}
                >
                    Yeni Personel
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filtered.map((user) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme.shadows[8],
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                    <Avatar 
                                        sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            mx: 'auto', 
                                            mb: 2,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {getInitials(user.name)}
                                    </Avatar>
                                    
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2c3e50' }}>
                                        {user.name}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                        <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                    
                                    <Chip
                                        icon={getRoleIcon(user.role)}
                                        label={user.role === 'admin' ? 'Yönetici' : 'Personel'}
                                        color={getRoleColor(user.role)}
                                        size="small"
                                        sx={{ mb: 2, fontWeight: 600 }}
                                    />
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Tooltip title="Personeli Sil">
                                            <IconButton 
                                                color="error" 
                                                size="small"
                                                onClick={() => handleDelete(user._id)}
                                                sx={{ 
                                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Personeli Düzenle">
                                            <IconButton 
                                                color="primary" 
                                                size="small"
                                                onClick={() => handleOpen(user)}
                                                sx={{ 
                                                    bgcolor: 'rgba(66, 165, 245, 0.1)',
                                                    '&:hover': { bgcolor: 'rgba(66, 165, 245, 0.2)' }
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    
                    {filtered.length === 0 && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                                <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Personel Bulunamadı
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {search ? 'Arama kriterlerinize uygun personel bulunamadı.' : 'Henüz personel eklenmemiş.'}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Person sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {editPersonnel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                            Personel Bilgileri
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField 
                                label="Ad Soyad" 
                                name="name" 
                                value={form.name} 
                                onChange={handleChange} 
                                fullWidth 
                                required 
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                }}
                            />
                            <TextField 
                                label="E-posta" 
                                name="email" 
                                value={form.email} 
                                onChange={handleChange} 
                                fullWidth 
                                required 
                                type="email"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                }}
                            />
                            <TextField 
                                label="Şifre" 
                                name="password" 
                                value={form.password} 
                                onChange={handleChange} 
                                fullWidth 
                                required 
                                type="password"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                }}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Rol</InputLabel>
                                <Select
                                    name="role"
                                    value={form.role}
                                    label="Rol"
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                        },
                                    }}
                                >
                                    <MenuItem value="user">Personel</MenuItem>
                                    <MenuItem value="admin">Yönetici</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
                    <Button onClick={handleClose} variant="outlined">
                        İptal
                    </Button>
                    <Button 
                        onClick={handleSavePersonnel} 
                        variant="contained"
                        disabled={loading}
                        sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Toast {...toast} onClose={() => setToast({ ...toast, open: false })} />
        </AppBox>
    );
}
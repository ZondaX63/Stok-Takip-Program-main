import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Grid
} from '@mui/material';
import { Add, Edit, Delete, Category } from '@mui/icons-material';
import api from '../api';
import Toast from '../components/Toast';
import { AppTitle } from '../components/Styled';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [search, setSearch] = useState('');
  const [productsByCategory, setProductsByCategory] = useState({});

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch {
      setToast({ open: true, message: 'Kategoriler alınamadı', type: 'error' });
    }
    setLoading(false);
  };

  const fetchProductsForCategory = async (catId) => {
    try {
      const res = await api.get('/products', { params: { category: catId, limit: 0 } });
      setProductsByCategory(prev => ({ ...prev, [catId]: res.data.products }));
    } catch {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (cat = null) => {
    setEditCategory(cat);
    setForm(cat ? { name: cat.name, description: cat.description } : { name: '', description: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSaveCategory = async () => {
    if (!form.name) {
        setToast({ open: true, message: 'Lütfen kategori adını doldurun.', severity: 'warning' });
        return;
    }

    setLoading(true);
    try {
        if (editCategory) {
            await api.put(`/categories/${editCategory._id}`, form);
            setToast({ open: true, message: 'Kategori güncellendi.', severity: 'success' });
        } else {
            await api.post('/categories', form);
            setToast({ open: true, message: 'Kategori eklendi.', severity: 'success' });
        }
        fetchCategories();
    } catch {
        setToast({ open: true, message: 'İşlem başarısız oldu.', severity: 'error' });
    } finally {
        setLoading(false);
    }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setToast({ open: true, message: 'Kategori silindi', type: 'success' });
      fetchCategories();
    } catch {
      setToast({ open: true, message: 'Silinemedi', type: 'error' });
    }
  };

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <AppTitle>Kategoriler</AppTitle>
      <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
        <TextField
          label="Ara"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Yeni Kategori</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Adı</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell align="right">Aksiyonlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(cat => (
              <React.Fragment key={cat._id}>
                <TableRow>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ürünleri Göster"><IconButton onClick={() => fetchProductsForCategory(cat._id)}><Category /></IconButton></Tooltip>
                    <Tooltip title="Düzenle"><IconButton onClick={() => handleOpen(cat)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Sil"><IconButton onClick={() => handleDelete(cat._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
                {productsByCategory[cat._id] && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Box sx={{ p: 2, background: '#f5f7fa', borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Bu Kategoriye Ait Ürünler</Typography>
                        {productsByCategory[cat._id].length === 0 ? (
                          <Typography color="text.secondary">Ürün yok</Typography>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {productsByCategory[cat._id].map(p => (
                              <li key={p._id}>{p.name} (SKU: {p.sku})</li>
                            ))}
                          </ul>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={3} align="center">Kayıt yok</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Category sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
              Kategori Bilgileri
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Kategori Adı"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Açıklama"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  fullWidth
                  multiline
                  minRows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
          <Button onClick={handleClose} variant="outlined">
            İptal
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      <Toast {...toast} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
};

export default CategoriesPage;
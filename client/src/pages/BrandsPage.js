import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Grid
} from '@mui/material';
import { Add, Edit, Delete, Storefront } from '@mui/icons-material';
import api from '../api';
import Toast from '../components/Toast';
import { AppTitle } from '../components/Styled';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [search, setSearch] = useState('');
  const [productsByBrand, setProductsByBrand] = useState({});

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch {
      setToast({ open: true, message: 'Markalar alınamadı', type: 'error' });
    }
    setLoading(false);
  };

  const fetchProductsForBrand = async (brandId) => {
    try {
      const res = await api.get('/products', { params: { brand: brandId, limit: 0 } });
      setProductsByBrand(prev => ({ ...prev, [brandId]: res.data.products }));
    } catch {}
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleOpen = (brand = null) => {
    setEditBrand(brand);
    setForm(brand ? { name: brand.name, description: brand.description } : { name: '', description: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSaveBrand = async () => {
    if (!form.name) {
        setToast({ open: true, message: 'Lütfen marka adını doldurun.', severity: 'warning' });
        return;
    }

    setLoading(true);
    try {
        if (editBrand) {
            await api.put(`/brands/${editBrand._id}`, form);
            setToast({ open: true, message: 'Marka güncellendi.', severity: 'success' });
        } else {
            await api.post('/brands', form);
            setToast({ open: true, message: 'Marka eklendi.', severity: 'success' });
        }
        fetchBrands();
    } catch {
        setToast({ open: true, message: 'İşlem başarısız oldu.', severity: 'error' });
    } finally {
        setLoading(false);
    }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/brands/${id}`);
      setToast({ open: true, message: 'Marka silindi', type: 'success' });
      fetchBrands();
    } catch {
      setToast({ open: true, message: 'Silinemedi', type: 'error' });
    }
  };

  const filtered = brands.filter(brand =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <AppTitle>Markalar</AppTitle>
      <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
        <TextField
          label="Ara"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Yeni Marka</Button>
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
            {filtered.map(brand => (
              <React.Fragment key={brand._id}>
                <TableRow>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>{brand.description}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ürünleri Göster"><IconButton onClick={() => fetchProductsForBrand(brand._id)}><Storefront /></IconButton></Tooltip>
                    <Tooltip title="Düzenle"><IconButton onClick={() => handleOpen(brand)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Sil"><IconButton onClick={() => handleDelete(brand._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
                {productsByBrand[brand._id] && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Box sx={{ p: 2, background: '#f5f7fa', borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Bu Markaya Ait Ürünler</Typography>
                        {productsByBrand[brand._id].length === 0 ? (
                          <Typography color="text.secondary">Ürün yok</Typography>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {productsByBrand[brand._id].map(p => (
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
          <Storefront sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editBrand ? 'Marka Düzenle' : 'Yeni Marka'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
              Marka Bilgileri
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Marka Adı"
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
            onClick={handleSaveBrand} 
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

export default BrandsPage;
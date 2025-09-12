import React, { useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, FormControl, InputLabel, Box, Typography, Avatar } from '@mui/material';
import { AccountBalanceWallet, Person, Business, Group } from '@mui/icons-material';

export default function AccountForm({ open, onClose, onSave, form, onChange }) {
  const nameRef = useRef();
  useEffect(() => {
    if (open && nameRef.current) nameRef.current.focus();
  }, [open]);

  // Validasyon
  const errors = {};
  if (!form.name) errors.name = 'Hesap adı zorunlu';
  if (!form.type) errors.type = 'Hesap tipi zorunlu';
  if (form.type === 'cari') {
    if (!form.cariType) errors.cariType = 'Cari türü zorunlu';
    if (!form.email) errors.email = 'E-posta zorunlu';
  }

  // İkon seçimi
  let icon = <AccountBalanceWallet fontSize="large" />;
  if (form.type === 'cari') icon = <Group fontSize="large" />;
  if (form.type === 'personnel') icon = <Person fontSize="large" />;
  if (form.type === 'company') icon = <Business fontSize="large" />;

  // Form reset
  const handleClose = () => {
    onClose();
    if (nameRef.current) nameRef.current.blur();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>{icon}</Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {form._id ? 'Hesabı Düzenle' : 'Yeni Hesap Ekle'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Hesap Adı"
          name="name"
          value={form.name}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
          inputRef={nameRef}
          placeholder="Örn: Kasa, Garanti Bankası, Ahmet Yılmaz"
          error={!!errors.name}
          helperText={errors.name || 'Hesabın kısa ve açıklayıcı adını girin.'}
        />
        <FormControl fullWidth margin="normal" required error={!!errors.type}>
          <InputLabel>Hesap Tipi</InputLabel>
          <Select name="type" value={form.type} label="Hesap Tipi" onChange={onChange}>
            <MenuItem value="cash">Kasa</MenuItem>
            <MenuItem value="bank">Banka</MenuItem>
            <MenuItem value="credit_card">Kredi Kartı</MenuItem>
            <MenuItem value="personnel">Personel</MenuItem>
            <MenuItem value="cari">Cari (Müşteri/Tedarikçi)</MenuItem>
          </Select>
          {errors.type && <Typography color="error" variant="caption">{errors.type}</Typography>}
        </FormControl>
        <TextField
          label="Bakiye"
          name="balance"
          value={form.balance}
          onChange={onChange}
          fullWidth
          margin="normal"
          type="number"
          required
          placeholder="Başlangıç bakiyesi"
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Para Birimi</InputLabel>
          <Select name="currency" value={form.currency} label="Para Birimi" onChange={onChange}>
            <MenuItem value="TRY">TRY</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
          </Select>
        </FormControl>
        {form.type === 'cari' && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: '#f8fafd' }}>
            <FormControl fullWidth margin="normal" required error={!!errors.cariType}>
              <InputLabel>Cari Türü</InputLabel>
              <Select name="cariType" value={form.cariType || ''} label="Cari Türü" onChange={onChange}>
                <MenuItem value="customer">Müşteri</MenuItem>
                <MenuItem value="supplier">Tedarikçi</MenuItem>
              </Select>
              {errors.cariType && <Typography color="error" variant="caption">{errors.cariType}</Typography>}
            </FormControl>
            <TextField
              label="E-posta"
              name="email"
              value={form.email || ''}
              onChange={onChange}
              fullWidth
              margin="normal"
              required
              placeholder="cari@ornek.com"
              error={!!errors.email}
              helperText={errors.email || 'Müşteri/tedarikçi için e-posta adresi.'}
            />
            <TextField
              label="Telefon"
              name="phone"
              value={form.phone || ''}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder="05xx xxx xx xx"
            />
            <TextField
              label="Adres"
              name="address"
              value={form.address || ''}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder="Açık adres bilgisi"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleClose} variant="outlined" size="large" sx={{ minWidth: 120 }}>İptal</Button>
        <Button onClick={onSave} variant="contained" size="large" sx={{ minWidth: 140 }} disabled={Object.keys(errors).length > 0}>
          {form._id ? 'Kaydet' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
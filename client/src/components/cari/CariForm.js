import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

const CariForm = ({ 
  open, 
  onClose, 
  isEdit, 
  formData, 
  onFormChange, 
  saveData,
  editingType,
  onTypeChange,
  setToast 
}) => {
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!formData.name || !formData.email) {
        setToast({ open: true, message: 'Lütfen tüm gerekli alanları doldurun.', type: 'error' });
        return;
    }
    setLoading(true);
    try {
        await saveData(formData);
        setToast({ open: true, message: 'Veri başarıyla kaydedildi.', type: 'success' });
        onClose();
    } catch (error) {
        setToast({ open: true, message: 'Veri kaydetme işlemi başarısız oldu.', type: 'error' });
    } finally {
        setLoading(false);
    }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <PersonAdd sx={{ fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? 'Cari Hesap Düzenle' : 'Yeni Cari Hesap'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
            Cari Hesap Bilgileri
          </Typography>
          
          <Grid container spacing={3}>
            {!isEdit && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Tip</InputLabel>
                  <Select
                    value={editingType}
                    label="Tip"
                    onChange={(e) => onTypeChange(e.target.value)}
                  >
                    <MenuItem value="customer">Müşteri</MenuItem>
                    <MenuItem value="supplier">Tedarikçi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField 
                label="Ad" 
                name="name" 
                value={formData.name || ''} 
                onChange={onFormChange} 
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
                label="E-posta" 
                name="email" 
                value={formData.email || ''} 
                onChange={onFormChange} 
                fullWidth 
                type="email"
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
                label="Telefon" 
                name="phone" 
                value={formData.phone || ''} 
                onChange={onFormChange} 
                fullWidth 
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
                label="Adres" 
                name="address" 
                value={formData.address || ''} 
                onChange={onFormChange} 
                fullWidth 
                multiline 
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>

            {editingType === 'customer' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Kredi Limiti" 
                    name="creditLimit" 
                    value={formData.creditLimit || ''} 
                    onChange={onFormChange} 
                    fullWidth 
                    type="number"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Notlar" 
                    name="notes" 
                    value={formData.notes || ''} 
                    onChange={onFormChange} 
                    fullWidth 
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
        <Button onClick={onClose} variant="outlined">
          İptal
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={loading}
          aria-label="Kaydet"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CariForm;

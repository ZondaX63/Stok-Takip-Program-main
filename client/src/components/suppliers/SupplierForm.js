import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Paper, Typography } from '@mui/material';
import { Business } from '@mui/icons-material';

const SupplierForm = ({ 
    open, 
    onClose, 
    onSave, 
    form, 
    onFormChange, 
    editSupplier 
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <Business sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {editSupplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                        Tedarikçi Bilgileri
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField 
                                label="Tedarikçi Adı" 
                                name="name" 
                                value={form.name} 
                                onChange={onFormChange} 
                                fullWidth 
                                required 
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#f5576c',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Yetkili Kişi" 
                                name="contactPerson" 
                                value={form.contactPerson} 
                                onChange={onFormChange} 
                                fullWidth 
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#f5576c',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="E-posta" 
                                name="email" 
                                value={form.email} 
                                onChange={onFormChange} 
                                fullWidth 
                                required 
                                type="email"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#f5576c',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Telefon" 
                                name="phone" 
                                value={form.phone} 
                                onChange={onFormChange} 
                                fullWidth 
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#f5576c',
                                        },
                                    },
                                }}
                            />
                        </Grid>
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
                    sx={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #e084ea 0%, #e4455a 100%)',
                        }
                    }}
                >
                    Kaydet
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupplierForm;

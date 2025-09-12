import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid
} from '@mui/material';

const CustomerForm = ({ 
    open, 
    onClose, 
    onSave, 
    form, 
    onFormChange, 
    editCustomer,
    loading = false 
}) => {
    const handleSubmit = () => {
        onSave(form);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {editCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            name="name"
                            label="Ad Soyad"
                            value={form.name}
                            onChange={onFormChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="email"
                            label="E-posta"
                            type="email"
                            value={form.email}
                            onChange={onFormChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="phone"
                            label="Telefon"
                            value={form.phone}
                            onChange={onFormChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="address"
                            label="Adres"
                            value={form.address}
                            onChange={onFormChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={loading || !form.name.trim()}
                >
                    {editCustomer ? 'Güncelle' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerForm;

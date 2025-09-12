import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, FormControl, InputLabel, Box } from '@mui/material';

export default function TransferDialog({ open, onClose, onSubmit, source, accounts }) {
  const [form, setForm] = useState({
    sourceAccount: '',
    targetAccount: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setForm(f => ({ ...f, sourceAccount: source?._id || '' }));
  }, [source]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (!form.sourceAccount || !form.targetAccount || !form.amount) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Hesaplar Arası Transfer</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Kaynak Hesap</InputLabel>
            <Select name="sourceAccount" value={form.sourceAccount} label="Kaynak Hesap" onChange={handleChange}>
              {accounts.map(acc => (
                <MenuItem key={acc._id} value={acc._id}>{acc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Hedef Hesap</InputLabel>
            <Select name="targetAccount" value={form.targetAccount} label="Hedef Hesap" onChange={handleChange}>
              {accounts.filter(acc => acc._id !== form.sourceAccount).map(acc => (
                <MenuItem key={acc._id} value={acc._id}>{acc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Tutar" name="amount" value={form.amount} onChange={handleChange} type="number" fullWidth required />
          <TextField label="Açıklama" name="description" value={form.description} onChange={handleChange} fullWidth />
          <TextField label="Tarih" name="date" value={form.date} onChange={handleChange} type="date" fullWidth InputLabelProps={{ shrink: true }} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSave} variant="contained" disabled={!form.sourceAccount || !form.targetAccount || !form.amount}>Transfer</Button>
      </DialogActions>
    </Dialog>
  );
} 
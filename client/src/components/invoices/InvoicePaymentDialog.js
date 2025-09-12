import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Typography } from '@mui/material';

/**
 * InvoicePaymentDialog
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: ({ amount:number, accountId:string, description?:string }) => void
 * - invoice: the invoice object (for showing info and type)
 * - accounts: list of accounts to pick from
 */
const InvoicePaymentDialog = ({ open, onClose, onSubmit, invoice, accounts = [] }) => {
  const remaining = Math.max(0, (invoice?.totalAmount || 0) - (invoice?.paidAmount || 0));
  const [form, setForm] = useState({ amount: remaining || 0, accountId: '', description: '' });

  useEffect(() => {
    // Reset when invoice changes
    setForm({ amount: remaining || 0, accountId: '', description: '' });
  }, [invoice?._id]);

  const selectableAccounts = useMemo(() => {
    // Only company-controlled accounts (exclude 'cari')
    return (accounts || []).filter(a => a.type !== 'cari');
  }, [accounts]);

  const title = invoice?.type === 'purchase' ? 'Fatura Öde' : 'Fatura Tahsil Et';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Fatura No: <b>{invoice?.invoiceNumber}</b> — Kalan: <b>₺{remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</b>
          </Typography>
          <TextField
            label="Tutar"
            type="number"
            fullWidth
            value={form.amount}
            onChange={(e) => setForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
            inputProps={{ min: 0, step: '0.01' }}
          />
          <TextField
            select
            label="Hesap"
            fullWidth
            value={form.accountId}
            onChange={(e) => setForm(prev => ({ ...prev, accountId: e.target.value }))}
          >
            {selectableAccounts.map(acc => (
              <MenuItem key={acc._id} value={acc._id}>
                {acc.name} — {acc.type.toUpperCase()} — {acc.balance?.toLocaleString('tr-TR')} {acc.currency}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Açıklama (opsiyonel)"
            fullWidth
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(form)}
          disabled={!form.accountId || !form.amount || form.amount <= 0}
        >
          Onayla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePaymentDialog;

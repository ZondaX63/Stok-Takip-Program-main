import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api';

export default function AccountDetail({ open, onClose, account }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && account?._id) {
      setLoading(true);
      api.get('/transactions', { params: { account: account._id, limit: 5 } })
        .then(res => setTransactions(res.data.slice(0, 5)))
        .finally(() => setLoading(false));
    }
  }, [open, account]);

  // Grafik için veri hazırla
  const chartData = transactions.map(tx => ({
    date: tx.date ? new Date(tx.date).toLocaleDateString() : '',
    gelir: tx.type === 'income' ? tx.amount : 0,
    gider: tx.type === 'expense' ? tx.amount : 0,
  }));

  if (!account) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{account.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{account.type}{account.cariType ? ` / ${account.cariType}` : ''}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, color: account.balance > 0 ? 'success.main' : account.balance < 0 ? 'error.main' : 'text.primary', my: 2 }}>{account.balance?.toLocaleString('tr-TR')} {account.currency}</Typography>
        <Typography variant="subtitle2">Açıklama</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>{account.description || '-'}</Typography>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Son 5 İşlem</Typography>
        <List dense>
          {transactions.map(tx => (
            <ListItem key={tx._id}>
              <ListItemText
                primary={tx.description || '-'}
                secondary={`${tx.type === 'income' ? 'Gelir' : tx.type === 'expense' ? 'Gider' : 'Transfer'} - ${tx.amount?.toLocaleString('tr-TR')} TL - ${tx.date ? new Date(tx.date).toLocaleDateString() : ''}`}
              />
            </ListItem>
          ))}
          {transactions.length === 0 && <ListItem><ListItemText primary="İşlem yok" /></ListItem>}
        </List>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Gelir/Gider Grafiği</Typography>
        <Box sx={{ width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="gelir" stroke="#2e7d32" strokeWidth={2} name="Gelir" />
              <Line type="monotone" dataKey="gider" stroke="#c62828" strokeWidth={2} name="Gider" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
} 
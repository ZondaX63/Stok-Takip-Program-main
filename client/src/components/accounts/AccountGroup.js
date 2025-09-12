import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { Add } from '@mui/icons-material';
import AccountCard from './AccountCard';

export default function AccountGroup({ title, accounts, onAdd, onEdit, onDelete, onDetail, onTransfer }) {
  // Grup toplamı
  const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{title}</Typography>
        <Button startIcon={<Add />} onClick={onAdd} variant="outlined" size="small">Yeni</Button>
      </Box>
      <Typography variant="subtitle2" sx={{ color: total > 0 ? 'success.main' : total < 0 ? 'error.main' : 'text.primary', mb: 1, fontWeight: 600 }}>
        Toplam: {total.toLocaleString('tr-TR')} TL
      </Typography>
      <Grid container spacing={2}>
        {accounts.map(acc => (
          <Grid item xs={12} sm={6} md={3} key={acc._id}>
            <AccountCard account={acc} onEdit={onEdit} onDelete={onDelete} onDetail={onDetail} onTransfer={onTransfer} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 
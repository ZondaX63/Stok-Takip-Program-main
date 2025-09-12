import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import api from '../api';

export default function ReportsPage() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [stock, setStock] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const incomeExpenseRes = await api.get('/reports/income-expense');
        setIncome(incomeExpenseRes.data.income);
        setExpense(incomeExpenseRes.data.expense);

        const stockRes = await api.get('/reports/stock-movements');
        setStock(stockRes.data);

        const cashFlowRes = await api.get('/reports/cash-flow');
        setCashFlow(cashFlowRes.data);
      } catch (err) {
        setError('Raporlar yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h5" color="primary" gutterBottom>Raporlar</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6">Toplam Gelir</Typography>
              <Typography variant="h4" color="primary">{income} ₺</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6">Toplam Gider</Typography>
              <Typography variant="h4" color="primary">{expense} ₺</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6">Nakit Akışı (Son 10 İşlem)</Typography>
              <Typography variant="body2">
                {cashFlow.slice(-10).map((c, i) => (
                  <span key={i}>{new Date(c.date).toLocaleDateString()} - {c.type === 'income' ? '+' : '-'}{c.amount} ₺<br /></span>
                ))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Stok Durumu</Typography>
        <Paper sx={{ p: 2, mt: 1 }}>
          <Grid container spacing={1}>
            {stock.map((s, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card sx={s.isCritical ? { bgcolor: '#fff3e0' } : {}}>
                  <CardContent>
                    <Typography>{s.name} ({s.sku})</Typography>
                    <Typography>Stok: {s.quantity}</Typography>
                    <Typography>Kritik Seviye: {s.criticalStockLevel}</Typography>
                    {s.isCritical && <Typography color="error">Kritik stok!</Typography>}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

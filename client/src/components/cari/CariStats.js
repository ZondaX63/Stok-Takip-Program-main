import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import StatCard from '../StatCard';
import { People, Store } from '@mui/icons-material';

const CariStats = ({ stats, selectedType, onStatCardClick }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>
        Cari Hesaplar
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Müşteriler"
            value={stats.customers}
            icon={<People />}
            color="#2196f3"
            bgColor="#e3f2fd"
            onClick={() => onStatCardClick('customer')}
            selected={selectedType === 'customer'}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Tedarikçiler"
            value={stats.suppliers}
            icon={<Store />}
            color="#ff9800"
            bgColor="#fff3e0"
            onClick={() => onStatCardClick('supplier')}
            selected={selectedType === 'supplier'}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CariStats;

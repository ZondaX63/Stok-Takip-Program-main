import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

export default function AccountTabs({ value, onChange }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs value={value} onChange={onChange} variant="scrollable" scrollButtons="auto">
        <Tab label="Şirket Hesapları" value="company" />
        <Tab label="Müşteri Hesapları" value="customer" />
        <Tab label="Tedarikçi Hesapları" value="supplier" />
      </Tabs>
    </Box>
  );
} 
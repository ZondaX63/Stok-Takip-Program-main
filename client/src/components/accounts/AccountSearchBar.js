import React from 'react';
import { Box, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';

export default function AccountSearchBar({ search, setSearch, filter, setFilter }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
      <TextField
        label="Ara"
        value={search}
        onChange={e => setSearch(e.target.value)}
        size="small"
        sx={{ minWidth: 200 }}
      />
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(e, val) => val && setFilter(val)}
        size="small"
        sx={{ ml: 2 }}
      >
        <ToggleButton value="all">Tümü</ToggleButton>
        <ToggleButton value="company">Şirket</ToggleButton>
        <ToggleButton value="customer">Müşteri</ToggleButton>
        <ToggleButton value="supplier">Tedarikçi</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
} 
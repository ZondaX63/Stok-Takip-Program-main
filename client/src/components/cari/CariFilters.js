import React from 'react';
import { Paper, Box, TextField, InputAdornment, Button, Tooltip } from '@mui/material';
import { Search, Download, Add } from '@mui/icons-material';

const CariFilters = ({ search, onSearchChange, onExport, onAdd }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Cari hesap ara..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ 
            minWidth: 300, 
            flex: 1,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <Tooltip title="CSV'ye aktar">
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={onExport}
            sx={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0e7c73 0%, #2dd865 100%)',
              }
            }}
          >
            Dışa Aktar
          </Button>
        </Tooltip>

        <Tooltip title="Yeni cari hesap ekle">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Ekle
          </Button>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default CariFilters;

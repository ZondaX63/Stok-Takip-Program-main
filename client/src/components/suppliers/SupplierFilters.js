import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

const SupplierFilters = ({ search, onSearchChange }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <TextField
                placeholder="Tedarikçi ara (ad, e-posta, yetkili kişi)..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{ 
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ) 
                }}
                sx={{ width: 400 }}
            />
        </Box>
    );
};

export default SupplierFilters;

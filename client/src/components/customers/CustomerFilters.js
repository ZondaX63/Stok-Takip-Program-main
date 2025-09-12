import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

const CustomerFilters = ({ search, onSearchChange }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <TextField
                placeholder="Müşteri ara..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ minWidth: 300 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

export default CustomerFilters;

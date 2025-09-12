import React from 'react';
import {
    Box, TextField, InputAdornment, FormControl, InputLabel, Select, 
    MenuItem, useTheme, useMediaQuery
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const InvoiceFilters = ({
    searchTerm,
    filters,
    onSearchChange,
    onFiltersChange
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
            <TextField
                placeholder="Fatura ara..."
                value={searchTerm}
                onChange={onSearchChange}
                sx={{ minWidth: isMobile ? '100%' : '250px' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />
            <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Tip</InputLabel>
                <Select
                    value={filters.type}
                    label="Tip"
                    onChange={(e) => onFiltersChange(prev => ({ ...prev, type: e.target.value }))}
                >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="sale">Satış</MenuItem>
                    <MenuItem value="purchase">Alış</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                    value={filters.status}
                    label="Durum"
                    onChange={(e) => onFiltersChange(prev => ({ ...prev, status: e.target.value }))}
                >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="draft">Taslak</MenuItem>
                    <MenuItem value="approved">Onaylı</MenuItem>
                    <MenuItem value="paid">Ödendi</MenuItem>
                    <MenuItem value="canceled">İptal</MenuItem>
                </Select>
            </FormControl>
            <DatePicker
                label="Başlangıç Tarihi"
                value={filters.dateFrom}
                onChange={(date) => onFiltersChange(prev => ({ ...prev, dateFrom: date }))}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />
            <DatePicker
                label="Bitiş Tarihi"
                value={filters.dateTo}
                onChange={(date) => onFiltersChange(prev => ({ ...prev, dateTo: date }))}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />
        </Box>
    );
};

export default InvoiceFilters;

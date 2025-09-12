import React from 'react';
import { Box, Button } from '@mui/material';
import { Add, FileDownload } from '@mui/icons-material';

const SupplierActions = ({ onNewSupplier, onExportCsv }) => {
    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={onNewSupplier}
            >
                Yeni Tedarikçi
            </Button>
            <Button 
                variant="outlined" 
                startIcon={<FileDownload />} 
                onClick={onExportCsv}
            >
                CSV Dışa Aktar
            </Button>
        </Box>
    );
};

export default SupplierActions;

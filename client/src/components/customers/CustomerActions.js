import React from 'react';
import { Box, Button } from '@mui/material';
import { Add, FileDownload } from '@mui/icons-material';

const CustomerActions = ({ onNewCustomer, onExportCsv }) => {
    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={onNewCustomer}
            >
                Yeni Müşteri
            </Button>
            <Button 
                variant="outlined" 
                startIcon={<FileDownload />} 
                onClick={onExportCsv}
            >
                CSV İndir
            </Button>
        </Box>
    );
};

export default CustomerActions;

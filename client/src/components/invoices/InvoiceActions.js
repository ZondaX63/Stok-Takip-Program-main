import React from 'react';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
import { Add, Download } from '@mui/icons-material';

const InvoiceActions = ({
    onNewInvoice,
    onExportCsv,
    onExportPdf
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={onNewInvoice}
                sx={{ fontSize: isMobile ? 13 : 16, px: isMobile ? 1.5 : 3, py: isMobile ? 0.5 : 1.5 }}
            >
                Yeni Fatura
            </Button>
            <Button 
                variant="outlined" 
                startIcon={<Download />} 
                onClick={onExportCsv}
                sx={{ fontSize: isMobile ? 13 : 16, px: isMobile ? 1.5 : 3, py: isMobile ? 0.5 : 1.5 }}
            >
                CSV
            </Button>
            <Button 
                variant="outlined" 
                startIcon={<Download />} 
                onClick={onExportPdf}
                sx={{ fontSize: isMobile ? 13 : 16, px: isMobile ? 1.5 : 3, py: isMobile ? 0.5 : 1.5 }}
            >
                PDF
            </Button>
        </Box>
    );
};

export default InvoiceActions;

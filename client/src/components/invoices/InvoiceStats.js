import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Receipt, Edit, CheckCircle, TrendingUp } from '@mui/icons-material';
import StatCard from '../StatCard';

const InvoiceStats = ({ stats }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 2, 
            mb: 3 
        }}>
            <StatCard 
                title="Toplam Fatura" 
                value={stats.total} 
                icon={<Receipt />} 
                color={theme.palette.primary.main} 
            />
            <StatCard 
                title="Taslak" 
                value={stats.draft} 
                icon={<Edit />} 
                color={theme.palette.warning.main} 
            />
            <StatCard 
                title="Onaylı" 
                value={stats.approved} 
                icon={<CheckCircle />} 
                color={theme.palette.success.main} 
            />
            <StatCard 
                title="Toplam Tutar" 
                value={`₺${stats.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} 
                icon={<TrendingUp />} 
                color={theme.palette.info.main} 
            />
        </Box>
    );
};

export default InvoiceStats;

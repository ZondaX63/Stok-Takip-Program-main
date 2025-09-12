import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Avatar, Tooltip, useMediaQuery } from '@mui/material';
import { Edit, Delete, Info, SwapHoriz } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function AccountCard({ account, onEdit, onDelete, onDetail, onTransfer }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Bakiye rengi
  const balanceColor = account.balance > 0 ? 'success.main' : account.balance < 0 ? 'error.main' : 'text.primary';
  // Son işlem özeti veya açıklama
  const summary = account.lastTransaction
    ? `${account.lastTransaction.description || ''} (${new Date(account.lastTransaction.date).toLocaleDateString()})`
    : (account.description || '-');

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: 'background.paper',
        minHeight: 140,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 8, border: '2px solid #1976d2' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: isMobile ? '100%' : 'auto',
      }}
    >
      <CardContent sx={{ pb: '8px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
            {account.name?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{account.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {account.type}{account.cariType ? ` / ${account.cariType}` : ''}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: balanceColor, mb: 1 }}>
          {account.balance?.toLocaleString('tr-TR')} {account.currency}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 20 }}>
          {summary}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Tooltip title="Transfer">
            <IconButton onClick={() => onTransfer(account)} size={isMobile ? 'medium' : 'small'} color="info"><SwapHoriz /></IconButton>
          </Tooltip>
          <Tooltip title="Detaylar">
            <IconButton onClick={() => onDetail(account)} size={isMobile ? 'medium' : 'small'} color="primary"><Info /></IconButton>
          </Tooltip>
          <Tooltip title="Düzenle">
            <IconButton onClick={() => onEdit(account)} size={isMobile ? 'medium' : 'small'} color="secondary"><Edit /></IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton onClick={() => onDelete(account)} size={isMobile ? 'medium' : 'small'} color="error"><Delete /></IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
} 
import React from 'react';
import { Paper, Box, Typography, Tooltip, IconButton } from '@mui/material';

export default function DashboardCard({ title, icon, value, color = '#fff', borderColor = '#e0e3e7', tooltip, children, action, negative, onClick }) {
  return (
    <Paper
      sx={{
        backgroundColor: color,
        border: `1.5px solid ${borderColor}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        borderRadius: 3,
        p: 3,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: onClick ? '0 4px 16px rgba(0,0,0,0.12)' : undefined }
      }}
      onClick={onClick}
      className="dashboard-card"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon && <Box sx={{ mr: 1, fontSize: 32 }}>{icon}</Box>}
        <Tooltip title={tooltip || ''} arrow>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', fontSize: 18, flex: 1 }}>{title}</Typography>
        </Tooltip>
        {action && <Box sx={{ ml: 1 }}>{action}</Box>}
      </Box>
      {value !== undefined && (
        <Typography
          variant="h4"
          sx={{
            color: negative ? '#e53935' : '#222',
            fontWeight: 800,
            letterSpacing: 1,
            mb: children ? 1 : 0
          }}
        >
          {value}
        </Typography>
      )}
      {children}
    </Paper>
  );
} 
import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

export default function AccountList({ accounts, onSelect, selectedId }) {
  return (
    <Grid container spacing={2}>
      {accounts.map(acc => (
        <Grid item xs={12} sm={6} md={3} key={acc._id}>
          <Card
            sx={{ cursor: 'pointer', border: selectedId === acc._id ? '2px solid #1976d2' : 'none' }}
            onClick={() => onSelect(acc)}
          >
            <CardContent>
              <Typography variant="h6">{acc.name}</Typography>
              <Typography variant="body2">{acc.balance?.toLocaleString('tr-TR')} {acc.currency}</Typography>
              <Typography variant="caption">{acc.type}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 
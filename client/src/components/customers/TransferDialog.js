import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';

const TransferDialog = ({ open, onClose, onSubmit, accounts, customers, suppliers }) => {
  const [transferForm, setTransferForm] = React.useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  });

  const handleTransferChange = (e) => {
    setTransferForm({
      ...transferForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (transferForm.fromAccountId && transferForm.toAccountId && transferForm.amount) {
      onSubmit(transferForm);
      setTransferForm({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: ''
      });
    }
  };

  const handleClose = () => {
    setTransferForm({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <SwapHoriz />
        <Typography variant="h6">Para Transferi</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Gönderen Hesap</InputLabel>
            <Select
              name="fromAccountId"
              value={transferForm.fromAccountId}
              label="Gönderen Hesap"
              onChange={handleTransferChange}
            >
              {accounts.map(account => (
                <MenuItem key={account._id} value={account._id}>
                  {account.name} ({account.type}) - ₺{account.balance?.toLocaleString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Alıcı Hesap</InputLabel>
            <Select
              name="toAccountId"
              value={transferForm.toAccountId}
              label="Alıcı Hesap"
              onChange={handleTransferChange}
            >
              {accounts.map(account => (
                <MenuItem key={account._id} value={account._id}>
                  {account.name} ({account.type}) - ₺{account.balance?.toLocaleString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Transfer Tutarı"
            name="amount"
            type="number"
            value={transferForm.amount}
            onChange={handleTransferChange}
            fullWidth
            InputProps={{
              startAdornment: '₺'
            }}
          />

          <TextField
            label="Açıklama (İsteğe Bağlı)"
            name="description"
            value={transferForm.description}
            onChange={handleTransferChange}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
        <Button onClick={handleClose} variant="outlined">
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Transfer Yap
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Info, Receipt, Payment } from '@mui/icons-material';

const CariDetailDialog = ({ 
  open, 
  onClose, 
  selectedCari, 
  detailTab, 
  onDetailTabChange,
  cariTransactions,
  cariSummary,
  quickTx,
  onQuickTxChange,
  onQuickTxSubmit,
  quickTxLoading,
  note,
  onNoteChange,
  onNoteSave 
}) => {
  if (!selectedCari) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Info />
        <Typography variant="h6">
          {selectedCari.name} - Detaylar
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Tabs value={detailTab} onChange={onDetailTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Genel Bilgiler" />
          <Tab label="İşlem Geçmişi" />
          <Tab label="Hızlı İşlem" />
          <Tab label="Notlar" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {detailTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedCari.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip 
                  label={selectedCari.type === 'customer' ? 'Müşteri' : 'Tedarikçi'} 
                  color={selectedCari.type === 'customer' ? 'primary' : 'warning'} 
                />
                <Chip label={selectedCari.email || 'E-posta yok'} color="info" />
                <Chip label={selectedCari.phone || 'Telefon yok'} />
                <Chip label={selectedCari.address || 'Adres yok'} />
                {selectedCari.creditLimit && (
                  <Chip label={`Kredi Limiti: ₺${selectedCari.creditLimit}`} color="secondary" />
                )}
                {selectedCari.notes && (
                  <Chip label={selectedCari.notes} color="default" />
                )}
              </Box>
              
              {cariSummary && (
                <Paper sx={{ p: 2, background: '#f5f5f5' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Özet</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Chip 
                        label={`Toplam Alışveriş: ₺${cariSummary.totalAmount?.toLocaleString() || 0}`} 
                        color="primary" 
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Chip 
                        label={`Ödenen: ₺${cariSummary.totalPaid?.toLocaleString() || 0}`} 
                        color="success" 
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Chip 
                        label={`Bakiye: ₺${cariSummary.balance?.toLocaleString() || 0}`} 
                        color={cariSummary.balance > 0 ? 'error' : 'warning'} 
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Box>
          )}
          
          {detailTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>İşlem Geçmişi</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell>Tutar</TableCell>
                      <TableCell>Tip</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cariTransactions.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(tx.date).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell>₺{tx.amount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={tx.type === 'income' ? 'Gelir' : 'Gider'} 
                            color={tx.type === 'income' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {cariTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Henüz işlem yok
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {detailTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Hızlı İşlem</Typography>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>İşlem Tipi</InputLabel>
                      <Select
                        value={quickTx.type}
                        label="İşlem Tipi"
                        onChange={(e) => onQuickTxChange({ target: { name: 'type', value: e.target.value } })}
                      >
                        <MenuItem value="income">Gelir (Borç Azaltma)</MenuItem>
                        <MenuItem value="expense">Gider (Borç Artırma)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Tutar"
                      name="amount"
                      type="number"
                      value={quickTx.amount}
                      onChange={onQuickTxChange}
                      fullWidth
                      InputProps={{ startAdornment: '₺' }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Açıklama"
                      name="description"
                      value={quickTx.description}
                      onChange={onQuickTxChange}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Tarih"
                      name="date"
                      type="date"
                      value={quickTx.date}
                      onChange={onQuickTxChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Payment />}
                      onClick={onQuickTxSubmit}
                      disabled={quickTxLoading || !quickTx.amount}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        }
                      }}
                    >
                      {quickTxLoading ? 'Kaydediliyor...' : 'İşlemi Kaydet'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
          
          {detailTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Notlar</Typography>
              <Paper sx={{ p: 3 }}>
                <TextField
                  label="Not"
                  value={note}
                  onChange={onNoteChange}
                  fullWidth
                  multiline
                  rows={6}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={onNoteSave}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  Notu Kaydet
                </Button>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, background: '#f8f9fa' }}>
        <Button onClick={onClose} variant="outlined">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CariDetailDialog;

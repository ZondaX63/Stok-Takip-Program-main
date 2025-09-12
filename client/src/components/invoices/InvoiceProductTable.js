import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  TextField, 
  Autocomplete, 
  Tooltip,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Delete, ContentCopy, Add } from '@mui/icons-material';

export default function InvoiceProductTable({ 
  productRows, 
  onProductRowChange, 
  onAddProductRow, 
  onRemoveProductRow, 
  products, 
  isReadOnly,
  invoiceType = 'sale'
}) {
  // productRows'un undefined olması durumunda boş array kullan
  const safeProductRows = productRows || [];
  const safeProducts = products || [];
  
  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Ürün</strong></TableCell>
              <TableCell align="center"><strong>Adet</strong></TableCell>
              <TableCell align="center"><strong>Birim Fiyat</strong></TableCell>
              <TableCell align="center"><strong>KDV (%)</strong></TableCell>
              <TableCell align="center"><strong>Toplam</strong></TableCell>
              <TableCell align="center"><strong>İşlem</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeProductRows.map((row, idx) => {
              const satirToplam = (row.quantity || 0) * (row.unitPrice || 0);
              const kdvTutari = satirToplam * ((row.taxRate || 0) / 100);
              const toplamTutar = satirToplam + kdvTutari;
              
              return (
                <TableRow key={`product-row-${idx}`} hover>
                  <TableCell sx={{ minWidth: 250 }}>
                    <Autocomplete
                      options={safeProducts}
                      getOptionLabel={option => `${option.name} ${option.barcode ? `(${option.barcode})` : ''}`}
                      getOptionKey={option => option._id || option.name}
                      filterOptions={(options, state) =>
                        options.filter(option =>
                          option.name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          (option.barcode && option.barcode.toLowerCase().includes(state.inputValue.toLowerCase())) ||
                          (option.code && option.code.toLowerCase().includes(state.inputValue.toLowerCase()))
                        )
                      }
                      value={safeProducts.find(p => p._id === row.product) || null}
                      onChange={(_, v) => {
                        onProductRowChange?.(idx, 'product', v ? v._id : '');
                        // Ürün seçildiğinde fiyatları otomatik doldur
                        if (v) {
                          const price = invoiceType === 'purchase' ? v.purchasePrice : v.salePrice;
                          onProductRowChange?.(idx, 'unitPrice', price || 0);
                          onProductRowChange?.(idx, 'taxRate', v.taxRate || 18);
                        }
                      }}
                      renderInput={params => (
                        <TextField 
                          {...params} 
                          label="Ürün Ara" 
                          required 
                          size="small"
                          placeholder="Ürün adı, barkod veya kod ile ara..."
                        />
                      )}
                      disabled={isReadOnly}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <TextField 
                      label="Adet" 
                      type="number" 
                      value={row.quantity || ''} 
                      onChange={e => onProductRowChange?.(idx, 'quantity', e.target.value)} 
                      required 
                      InputProps={{ readOnly: isReadOnly }} 
                      sx={{ width: 100 }}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <TextField 
                      label="Birim Fiyat" 
                      type="number" 
                      value={row.unitPrice || ''} 
                      onChange={e => onProductRowChange?.(idx, 'unitPrice', e.target.value)} 
                      required 
                      InputProps={{ readOnly: isReadOnly }} 
                      sx={{ width: 120 }}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <TextField 
                      label="KDV (%)" 
                      type="number" 
                      value={row.taxRate || ''} 
                      onChange={e => onProductRowChange?.(idx, 'taxRate', e.target.value)} 
                      required 
                      InputProps={{ readOnly: isReadOnly }} 
                      sx={{ width: 100 }}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <TextField 
                      label="Toplam" 
                      value={toplamTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                      InputProps={{ readOnly: true }} 
                      sx={{ 
                        width: 140,
                        '& .MuiInputBase-input': { 
                          fontWeight: 600,
                          color: '#2e7d32'
                        }
                      }}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Satırı Sil">
                        <IconButton 
                          onClick={() => onRemoveProductRow?.(idx)} 
                          color="error"
                          disabled={isReadOnly}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Satırı Kopyala">
                        <IconButton 
                          onClick={() => onAddProductRow?.(idx)} 
                          color="primary"
                          disabled={isReadOnly}
                          size="small"
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {/* Boş satır gösterimi */}
            {safeProductRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Henüz ürün eklenmedi. Yeni satır eklemek için aşağıdaki butona tıklayın.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Yeni satır ekleme butonu */}
      {!isReadOnly && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => onAddProductRow?.()}
            startIcon={<Add />}
            size="large"
            sx={{ minWidth: 200 }}
          >
            Yeni Ürün/Hizmet Ekle
          </Button>
        </Box>
      )}
    </Box>
  );
}
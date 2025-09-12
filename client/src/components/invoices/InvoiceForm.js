import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Autocomplete,
  InputAdornment,
  Box,
  useMediaQuery,
  Paper,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { Receipt, Person, Business, ShoppingCart, Calculate } from '@mui/icons-material';
import InvoiceProductTable from './InvoiceProductTable';

const currencyOptions = [
  { value: 'TRY', label: 'TL' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const typeOptions = [
  { value: 'sale', label: 'Satış Faturası' },
  { value: 'purchase', label: 'Alış Faturası' },
  { value: 'return', label: 'İade Faturası' },
  { value: 'proforma', label: 'Proforma Fatura' },
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Beklemede' },
  { value: 'partial', label: 'Kısmi Ödendi' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'overdue', label: 'Vadesi Geçmiş' },
];

function InvoiceForm({
  open,
  onClose,
  onSave,
  form = {},
  productRows = [],
  onFormChange,
  onProductRowChange,
  onAddProductRow,
  onRemoveProductRow,
  products = [],
  customers = [],
  suppliers = [],
  isReadOnly = false,
}) {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const safeForm = form || {};
  const safeProductRows = productRows || [];

  // Müşteri ve tedarikçileri birleştir
  const allPartners = React.useMemo(() => {
    return [...(customers || []), ...(suppliers || [])];
  }, [customers, suppliers]);

  // Otomatik fatura numarası oluşturma
  React.useEffect(() => {
    if (open && !safeForm._id && !safeForm.invoiceNumber) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const time = String(today.getHours()).padStart(2, '0') + String(today.getMinutes()).padStart(2, '0');
      
      const autoInvoiceNo = `${year}${month}${day}-${time}`;
      
      onFormChange({ target: { name: 'invoiceNumber', value: autoInvoiceNo } });
    }
  }, [open, safeForm._id, safeForm.invoiceNumber, onFormChange]);

  // Fatura tipi değiştiğinde tarihi bugüne ayarla
  React.useEffect(() => {
    if (open && !safeForm._id && !safeForm.date) {
      onFormChange({ target: { name: 'date', value: new Date() } });
    }
  }, [open, safeForm._id, safeForm.date, onFormChange]);

  // Müşteri/Tedarikçi seçildiğinde bilgileri otomatik doldur
  React.useEffect(() => {
    if (safeForm.customerOrSupplier && allPartners?.length > 0) {
      const selectedPartner = allPartners.find(p => p._id === safeForm.customerOrSupplier);
      if (selectedPartner) {
        // Seçilen müşteri/tedarikçinin bilgilerini forma doldur
        const updates = {};
        if (selectedPartner.taxOffice && !safeForm.taxOffice) updates.taxOffice = selectedPartner.taxOffice;
        if (selectedPartner.taxNumber && !safeForm.taxNumber) updates.taxNumber = selectedPartner.taxNumber;
        if (selectedPartner.phone && !safeForm.phone) updates.phone = selectedPartner.phone;
        if (selectedPartner.email && !safeForm.email) updates.email = selectedPartner.email;
        if (selectedPartner.address && !safeForm.address) updates.address = selectedPartner.address;
        
        // Eğer güncelleme yapılacaksa toplu olarak güncelle
        if (Object.keys(updates).length > 0) {
          Object.entries(updates).forEach(([key, value]) => {
            onFormChange({ target: { name: key, value } });
          });
        }
      }
    }
  }, [safeForm.customerOrSupplier, allPartners, safeForm.taxOffice, safeForm.taxNumber, safeForm.phone, safeForm.email, safeForm.address, onFormChange]);

  // Hesaplamalar
  const araToplam = safeProductRows.reduce((total, row) => {
    return total + ((row.quantity || 0) * (row.unitPrice || 0));
  }, 0);

  const toplamKdv = safeProductRows.reduce((total, row) => {
    const satirToplam = (row.quantity || 0) * (row.unitPrice || 0);
    const kdv = satirToplam * ((row.taxRate || 0) / 100);
    return total + kdv;
  }, 0);

  const genelToplam = araToplam + toplamKdv;

  // Form geçerliliği kontrolü
  const isFormValid = () => {
    return (
      safeForm.invoiceNumber?.trim() &&
      safeForm.type &&
      safeForm.customerOrSupplier &&
      safeForm.date &&
      safeProductRows.length > 0 &&
      safeProductRows.every(row => row.product && row.quantity > 0 && row.unitPrice > 0)
    );
  };

  // Uyarı mesajı
  const getValidationMessage = () => {
    if (!safeForm.invoiceNumber?.trim()) return "Fatura numarası gerekli";
    if (!safeForm.type) return "Fatura tipi seçilmeli";
    if (!safeForm.customerOrSupplier) return "Müşteri/Tedarikçi seçilmeli";
    if (!safeForm.date) return "Fatura tarihi seçilmeli";
    if (safeProductRows.length === 0) return "En az bir ürün/hizmet eklenmeli";
    if (safeProductRows.some(row => !row.product)) return "Tüm satırlarda ürün seçilmeli";
    if (safeProductRows.some(row => row.quantity <= 0)) return "Tüm satırlarda miktar 0'dan büyük olmalı";
    if (safeProductRows.some(row => row.unitPrice <= 0)) return "Tüm satırlarda birim fiyat 0'dan büyük olmalı";
    return "";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        backgroundColor: '#f8f9fa'
      }}>
        <Receipt color="primary" />
        <Box component="span" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {safeForm._id ? 'Faturayı Düzenle' : 'Yeni Fatura Oluştur'}
        </Box>
        {safeForm.invoiceNumber && (
          <Chip 
            label={`No: ${safeForm.invoiceNumber}`} 
            color="primary" 
            variant="outlined" 
            size="small"
          />
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#fafafa' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
          <Box sx={{ p: 3 }}>
            
            {/* 1. FATURA BİLGİLERİ */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Receipt color="primary" />
                <Typography variant="h6" fontWeight={600} color="primary">
                  1. Fatura Bilgileri
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fatura No *"
                    name="invoiceNumber"
                    value={safeForm.invoiceNumber || ''}
                    onChange={onFormChange}
                    fullWidth
                    required
                    disabled={isReadOnly}
                    variant="outlined"
                    error={!safeForm.invoiceNumber}
                    helperText={!safeForm.invoiceNumber ? "Zorunlu alan" : "Otomatik oluşturuldu, düzenleyebilirsiniz"}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Fatura Tipi *"
                    name="type"
                    value={safeForm.type || ''}
                    onChange={onFormChange}
                    fullWidth
                    required
                    disabled={isReadOnly}
                    variant="outlined"
                  >
                    {typeOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Para Birimi"
                    name="currency"
                    value={safeForm.currency || 'TRY'}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                  >
                    {currencyOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Ödeme Durumu"
                    name="paymentStatus"
                    value={safeForm.paymentStatus || 'pending'}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                  >
                    {paymentStatusOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Fatura Tarihi *"
                    value={safeForm.date || null}
                    onChange={date => onFormChange({ target: { name: 'date', value: date } })}
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        variant: "outlined"
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Vade Tarihi"
                    value={safeForm.dueDate || null}
                    onChange={date => onFormChange({ target: { name: 'dueDate', value: date } })}
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined"
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 2. MÜŞTERİ / TEDARİKÇİ BİLGİLERİ */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Business color="primary" />
                <Typography variant="h6" fontWeight={600} color="primary">
                  2. {safeForm.type === 'purchase' ? 'Tedarikçi' : 'Müşteri'} Bilgileri
                </Typography>
                {safeForm.customerOrSupplier && (
                  <Chip 
                    label="Bilgiler otomatik dolduruldu" 
                    color="success" 
                    variant="outlined" 
                    size="small"
                  />
                )}
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={allPartners || []}
                    getOptionLabel={option => option.name || ''}
                    getOptionKey={option => option._id}
                    value={allPartners?.find(p => p._id === safeForm.customerOrSupplier) || null}
                    onChange={(_, v) => onFormChange({ target: { name: 'customerOrSupplier', value: v ? v._id : '' } })}
                    renderInput={params => (
                      <TextField 
                        {...params} 
                        label={`${safeForm.type === 'purchase' ? 'Tedarikçi' : 'Müşteri'} Seçin *`}
                        fullWidth 
                        required 
                        variant="outlined"
                        error={!safeForm.customerOrSupplier}
                        helperText={!safeForm.customerOrSupplier ? "Zorunlu alan" : "Seçim yapıldığında bilgiler otomatik doldurulacaktır"}
                      />
                    )}
                    disabled={isReadOnly}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option._id}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {option.email || option.phone || 'İletişim bilgisi yok'}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Detay Bilgiler" size="small" />
                  </Divider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Vergi Dairesi"
                    name="taxOffice"
                    value={safeForm.taxOffice || ''}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Vergi No"
                    name="taxNumber"
                    value={safeForm.taxNumber || ''}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Telefon"
                    name="phone"
                    value={safeForm.phone || ''}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="E-posta"
                    name="email"
                    type="email"
                    value={safeForm.email || ''}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Adres"
                    name="address"
                    value={safeForm.address || ''}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 3. ÜRÜN / HİZMET SATIRLARI */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <ShoppingCart color="primary" />
                <Typography variant="h6" fontWeight={600} color="primary">
                  3. Ürün / Hizmet Satırları
                </Typography>
              </Stack>
              <InvoiceProductTable
                productRows={safeProductRows}
                onProductRowChange={onProductRowChange}
                onAddProductRow={onAddProductRow}
                onRemoveProductRow={onRemoveProductRow}
                products={products}
                isReadOnly={isReadOnly}
                invoiceType={safeForm.type}
              />
            </Paper>

            {/* 4. TOPLAMLAR */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Calculate color="primary" />
                <Typography variant="h6" fontWeight={600} color="primary">
                  4. Toplamlar
                </Typography>
              </Stack>
              
              {/* Mobil için dikey, desktop için yatay düzen */}
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={3} 
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                <Box sx={{ minWidth: { xs: '100%', md: 200 } }}>
                  <TextField
                    label="Ara Toplam (KDV Hariç)"
                    value={araToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <InputAdornment position="end">{safeForm.currency || 'TL'}</InputAdornment>,
                    }}
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      '& .MuiInputBase-input': { fontWeight: 500 }
                    }}
                  />
                </Box>
                
                <Box sx={{ minWidth: { xs: '100%', md: 200 } }}>
                  <TextField
                    label="Toplam KDV"
                    value={toplamKdv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <InputAdornment position="end">{safeForm.currency || 'TL'}</InputAdornment>,
                    }}
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      backgroundColor: '#fff3e0',
                      '& .MuiInputBase-input': { fontWeight: 500 }
                    }}
                  />
                </Box>
                
                <Box sx={{ minWidth: { xs: '100%', md: 220 } }}>
                  <TextField
                    label="GENEL TOPLAM (KDV Dahil)"
                    value={genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <InputAdornment position="end">{safeForm.currency || 'TL'}</InputAdornment>,
                    }}
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      backgroundColor: '#e8f5e8',
                      '& .MuiInputBase-input': { 
                        fontWeight: 700, 
                        fontSize: '1.2rem',
                        color: '#2e7d32'
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: '#2e7d32'
                      }
                    }}
                  />
                </Box>
              </Stack>
              
              {/* Döviz kuru sadece TRY değilse göster */}
              {safeForm.currency !== 'TRY' && (
                <Box sx={{ mt: 3, maxWidth: 300, ml: 'auto' }}>
                  <TextField
                    label="Döviz Kuru"
                    name="exchangeRate"
                    type="number"
                    value={safeForm.exchangeRate || ''}
                    onChange={onFormChange}
                    fullWidth
                    disabled={isReadOnly}
                    variant="outlined"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">TL/{safeForm.currency}</InputAdornment>,
                    }}
                    helperText="1 {safeForm.currency} = ? TL"
                  />
                </Box>
              )}
              
              {/* Satır sayısı bilgisi */}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="caption" color="textSecondary">
                  Toplam {safeProductRows.length} satır ürün/hizmet
                </Typography>
              </Box>
            </Paper>

            {/* 5. EK ALANLAR */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 3 }}>
                5. Ek Bilgiler ve Dosyalar
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Açıklama / Not"
                    name="description"
                    value={safeForm.description || ''}
                    onChange={onFormChange}
                    fullWidth
                    multiline
                    rows={4}
                    disabled={isReadOnly}
                    variant="outlined"
                    placeholder="Fatura ile ilgili ek açıklamalarınızı, özel şartları veya notları buraya yazabilirsiniz..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    border: '2px dashed #e0e0e0', 
                    borderRadius: 2, 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f5f5f5'
                    }
                  }}>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={isReadOnly}
                      size="large"
                      sx={{ mb: 2 }}
                    >
                      📎 Dosya Ekle
                      <input 
                        type="file" 
                        hidden 
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" 
                        multiple
                      />
                    </Button>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Fatura ile ilgili belgeleri yükleyebilirsiniz
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Desteklenen formatlar: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Her biri max 5MB)
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Fatura özeti card */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 2, 
                    p: 2,
                    border: '1px solid #e9ecef'
                  }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      📋 Fatura Özeti
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Typography variant="body2">
                        <strong>Tip:</strong> {typeOptions.find(t => t.value === safeForm.type)?.label || 'Seçilmedi'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Para Birimi:</strong> {safeForm.currency || 'TRY'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ürün Sayısı:</strong> {safeProductRows.length}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Durum:</strong> {paymentStatusOptions.find(p => p.value === safeForm.paymentStatus)?.label || 'Beklemede'}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        {/* Validasyon mesajı */}
        {!isFormValid() && (
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>
              ⚠️ {getValidationMessage()}
            </Typography>
          </Box>
        )}
        
        {/* Geçerli formda özet bilgi */}
        {isFormValid() && (
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
              ✅ Form hazır - Toplam: {genelToplam.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {safeForm.currency || 'TL'}
            </Typography>
          </Box>
        )}
        
        <Button 
          onClick={onClose} 
          variant="outlined"
          size="large"
          sx={{ minWidth: 120, order: { xs: 2, sm: 1 } }}
        >
          İptal
        </Button>
        
        <Button 
          onClick={() => onSave?.(safeForm, safeProductRows)} 
          variant="contained"
          size="large"
          sx={{ 
            minWidth: 140,
            order: { xs: 1, sm: 2 },
            backgroundColor: isFormValid() ? '#2e7d32' : undefined,
            '&:hover': {
              backgroundColor: isFormValid() ? '#1b5e20' : undefined,
            }
          }}
          disabled={!isFormValid()}
        >
          {safeForm._id ? '📝 Güncelle' : '💾 Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InvoiceForm;

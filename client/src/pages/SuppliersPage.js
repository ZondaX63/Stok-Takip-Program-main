import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Business, Info } from '@mui/icons-material';
import api from '../api';
import Toast from '../components/Toast';
import { unparse } from 'papaparse';
import { AppContext } from '../contexts/AppContext';
import SupplierTable from '../components/suppliers/SupplierTable';
import SupplierFilters from '../components/suppliers/SupplierFilters';
import SupplierActions from '../components/suppliers/SupplierActions';
import SupplierForm from '../components/suppliers/SupplierForm';

export default function SuppliersPage() {
  const { refreshTriggers } = useContext(AppContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSupplier, setDetailSupplier] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers?limit=0');
      // Backend'den gelen response formatını normalize et
      const suppliersData = res.data.suppliers || res.data.docs || res.data || [];
      // Fetch debt for each supplier
      const suppliersWithDebt = await Promise.all(
        suppliersData.map(async (supplier) => {
          try {
            const debtRes = await api.get(`/suppliers/${supplier._id}/debt`);
            return { ...supplier, debt: debtRes.data.debt, credit: debtRes.data.totalPaid };
          } catch {
            return { ...supplier, debt: 0, credit: 0 };
          }
        })
      );
      setSuppliers(Array.isArray(suppliersWithDebt) ? suppliersWithDebt : []);
    } catch {
      setToast({ open: true, message: 'Tedarikçiler alınamadı', severity: 'error' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  // RefreshTrigger dinleyicisi - Mali işler sekmesinden tedarikçi oluşturulduğunda tetiklenir
  useEffect(() => {
    if (refreshTriggers.suppliers > 0) {
      fetchSuppliers();
    }
  }, [refreshTriggers.suppliers, fetchSuppliers]);

  const handleOpen = (supplier = null) => {
    setEditSupplier(supplier);
    setForm(supplier ? { ...supplier } : { name: '', contactPerson: '', email: '', phone: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setToast({ open: true, message: 'Lütfen tüm alanları doldurun.', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier._id}`, form);
        setToast({ open: true, message: 'Tedarikçi güncellendi', severity: 'success' });
      } else {
        await api.post('/suppliers', form);
        setToast({ open: true, message: 'Tedarikçi eklendi', severity: 'success' });
      }
      fetchSuppliers();
      handleClose();
    } catch {
      setToast({ open: true, message: 'İşlem başarısız oldu.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setToast({ open: true, message: 'Tedarikçi silindi', severity: 'success' });
      fetchSuppliers();
    } catch {
      setToast({ open: true, message: 'Silinemedi', severity: 'error' });
    }
  };

  const handleDetailOpen = async (supplierId) => {
    setDetailOpen(true);
    setDetailSupplier(null);
    setInvoices([]);
    setDetailLoading(true);
    try {
      const [supRes, invRes] = await Promise.all([
        api.get(`/suppliers/${supplierId}`),
        api.get(`/invoices?supplier=${supplierId}&limit=0`)
      ]);
      setDetailSupplier(supRes.data);
      setInvoices(invRes.data.docs || invRes.data.invoices || []);
    } catch {
      setToast({ open: true, message: 'Detaylar alınamadı', severity: 'error' });
    }
    setDetailLoading(false);
  };
  const handleDetailClose = () => setDetailOpen(false);

  const handleExportCSV = () => {
    // Array kontrolü ekle
    const suppliersArray = Array.isArray(suppliers) ? suppliers : [];
    
    const filtered = suppliersArray.filter(s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );

    const csvData = unparse(filtered, {
      columns: ["name", "contactPerson", "email", "phone"],
      header: true,
    });
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tedarikciler.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business />
          Tedarikçiler
        </Typography>
      </Box>

      <SupplierFilters 
        search={search} 
        onSearchChange={setSearch} 
      />

      <SupplierActions
        onNewSupplier={() => handleOpen()}
        onExportCsv={handleExportCSV}
      />

      <SupplierTable
        suppliers={suppliers}
        search={search}
        onEdit={handleOpen}
        onDelete={handleDelete}
        onViewDetail={handleDetailOpen}
      />

      <SupplierForm
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        form={form}
        onFormChange={handleChange}
        editSupplier={editSupplier}
      />
      <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="md" fullWidth>
        <DialogTitle><Info sx={{ mr: 1, verticalAlign: 'middle' }} /> Tedarikçi Detayları</DialogTitle>
        <DialogContent dividers>
          {detailLoading || !detailSupplier ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><CircularProgress /></Box>
          ) : (
            <Box>
              <Typography variant="h6">{detailSupplier.name}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={detailSupplier.email} color="info" />
                <Chip label={detailSupplier.phone || 'Telefon yok'} />
                <Chip label={detailSupplier.address || 'Adres yok'} />
                <Chip label={`Kredi Limiti: ₺${detailSupplier.creditLimit || 0}`} color="secondary" />
                {detailSupplier.notes && <Chip label={detailSupplier.notes} color="default" />}
              </Box>
              {/* Borç ve alışveriş hesaplama */}
              {(() => {
                let totalDebt = 0, totalPurchase = 0;
                invoices.forEach(inv => {
                  if (inv.type === 'purchase') {
                    totalPurchase += inv.totalAmount || 0;
                    if (inv.status !== 'paid') totalDebt += inv.totalAmount || 0;
                  }
                });
                return <Box sx={{ mb: 2 }}>
                  <Chip label={`Toplam Alışveriş: ₺${totalPurchase.toLocaleString()}`} color="primary" />
                  <Chip label={`Toplam Borç: ₺${totalDebt.toLocaleString()}`} color={totalDebt > (detailSupplier.creditLimit || 0) ? 'error' : 'warning'} />
                  {totalDebt > (detailSupplier.creditLimit || 0) && <Chip label="Kredi Limiti Aşıldı!" color="error" />}
                </Box>;
              })()}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Fatura/İşlem Geçmişi</Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Fatura No</TableCell>
                      <TableCell>Tip</TableCell>
                      <TableCell>Tutar</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow><TableCell colSpan={5} align="center">Fatura yok</TableCell></TableRow>
                    ) : invoices.map(inv => (
                      <TableRow key={inv._id}>
                        <TableCell>{inv.date ? new Date(inv.date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.type === 'purchase' ? 'Alış' : 'Satış'}</TableCell>
                        <TableCell>₺{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                        <TableCell>{inv.status === 'paid' ? 'Ödendi' : inv.status === 'approved' ? 'Onaylı' : 'Taslak'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Toast {...toast} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}

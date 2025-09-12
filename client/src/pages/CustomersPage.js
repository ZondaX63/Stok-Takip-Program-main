import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { People } from '@mui/icons-material';
import api from '../api';
import Toast from '../components/Toast';
import { unparse } from 'papaparse';
import CustomerFilters from '../components/customers/CustomerFilters';
import CustomerActions from '../components/customers/CustomerActions';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerForm from '../components/customers/CustomerForm';
import TransferDialog from '../components/customers/TransferDialog';
import { AppContext } from '../contexts/AppContext';

export default function CustomersPage() {
  const { refreshTriggers } = useContext(AppContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [debtInfo, setDebtInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [adjustDialog, setAdjustDialog] = useState({ open: false });
  const [adjustForm, setAdjustForm] = useState({ amount: '', description: '', accountId: '' });
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers?limit=0');
      // Backend'den gelen response formatını normalize et
      const customersData = res.data.customers || res.data.docs || res.data || [];
      // Fetch debt for each customer
      const customersWithDebt = await Promise.all(
        customersData.map(async (customer) => {
          try {
            const debtRes = await api.get(`/customers/${customer._id}/debt`);
            return { ...customer, debt: debtRes.data.debt, credit: debtRes.data.totalPaid };
          } catch {
            return { ...customer, debt: 0, credit: 0 };
          }
        })
      );
      setCustomers(Array.isArray(customersWithDebt) ? customersWithDebt : []);
    } catch {
      setToast({ open: true, message: 'Müşteriler alınamadı', severity: 'error' });
    }
    setLoading(false);
  }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // RefreshTrigger dinleyicisi - Mali işler sekmesinden müşteri oluşturulduğunda tetiklenir
  useEffect(() => {
    if (refreshTriggers.customers > 0) {
      fetchCustomers();
    }
  }, [refreshTriggers.customers, fetchCustomers]);

  const handleOpen = (customer = null) => {
    setEditCustomer(customer);
    setForm(customer ? { ...customer } : { name: '', email: '', phone: '', address: '' });
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveCustomer = async () => {
    if (!form.name || !form.email) {
        setToast({ open: true, message: 'Lütfen tüm alanları doldurun.', severity: 'warning' });
        return;
    }

    setLoading(true);
    try {
        if (editCustomer) {
            await api.put(`/customers/${editCustomer._id}`, form);
            setToast({ open: true, message: 'Müşteri güncellendi.', severity: 'success' });
        } else {
            await api.post('/customers', form);
            setToast({ open: true, message: 'Müşteri eklendi.', severity: 'success' });
        }
        fetchCustomers();
    } catch {
        setToast({ open: true, message: 'İşlem başarısız oldu.', severity: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/customers/${id}`);
      setToast({ open: true, message: 'Müşteri silindi', severity: 'success' });
      fetchCustomers();
    } catch {
      setToast({ open: true, message: 'Silinemedi', severity: 'error' });
    }
  };

  const fetchDebt = async (customerId) => {
    try {
      const res = await api.get(`/customers/${customerId}/debt`);
      setDebtInfo(res.data);
    } catch {
      setDebtInfo(null);
    }
  };
  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch {
      setAccounts([]);
    }
  };

  const fetchTransactions = async (customerId) => {
    try {
      const res = await api.get('/transactions', { params: { customer: customerId } });
      setTransactions(res.data);
    } catch {
      setTransactions([]);
    }
  };
  const fetchAllCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setAllCustomers(res.data.customers || res.data.docs || res.data);
    } catch {
      setAllCustomers([]);
    }
  };

  const handleDetailOpen = async (customerId) => {
    setDetailOpen(true);
    setDetailCustomer(null);
    setInvoices([]);
    setDetailLoading(true);
    setDebtInfo(null);
    await Promise.all([fetchAccounts(), fetchDebt(customerId), fetchTransactions(customerId), fetchAllCustomers()]);
    try {
      const [custRes, invRes] = await Promise.all([
        api.get(`/customers/${customerId}`),
        api.get(`/invoices?customer=${customerId}&limit=0`)
      ]);
      setDetailCustomer(custRes.data);
      setInvoices(invRes.data.docs || invRes.data.invoices || []);
    } catch {
      setToast({ open: true, message: 'Detaylar alınamadı', severity: 'error' });
    }
    setDetailLoading(false);
  };
  const handleDetailClose = () => setDetailOpen(false);

  const handleDetailTabChange = (e, v) => setDetailTab(v);

  const handleOpenAdjust = () => {
    setAdjustForm({ amount: '', description: '', accountId: '' });
    setAdjustDialog({ open: true });
  };
  const handleCloseAdjust = () => setAdjustDialog({ open: false });
  const handleAdjustChange = (e) => setAdjustForm({ ...adjustForm, [e.target.name]: e.target.value });
  const handleAdjust = async () => {
    setAdjustLoading(true);
    try {
      await api.post(`/customers/${detailCustomer.customer?._id || detailCustomer._id}/debt-adjustment`, {
        amount: Number(adjustForm.amount),
        description: adjustForm.description,
        accountId: adjustForm.accountId
      });
      setToast({ open: true, message: 'Borç düzeltme işlemi başarılı', severity: 'success' });
      await fetchDebt(detailCustomer.customer?._id || detailCustomer._id);
      handleCloseAdjust();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.msg || 'Borç düzeltme başarısız', severity: 'error' });
    }
    setAdjustLoading(false);
  };

  const handleTransferOpen = () => setTransferOpen(true);
  const handleTransferClose = () => setTransferOpen(false);

  const handleTransferSubmit = async (data) => {
    try {
      if (data.sourceType === 'account' && data.targetType === 'account') {
        // Hesaplar arası transfer
        await api.post('/accounts/transfer', {
          sourceAccountId: data.sourceId,
          targetAccountId: data.targetId,
          amount: data.amount,
          description: data.description,
          date: data.date
        });
      } else if (
        (data.sourceType === 'account' && (data.targetType === 'customer' || data.targetType === 'supplier')) ||
        ((data.sourceType === 'customer' || data.sourceType === 'supplier') && data.targetType === 'account')
      ) {
        // Hesap ↔ Cari transfer
        const body = {
          amount: data.amount,
          description: data.description,
          date: data.date
        };
        if (data.sourceType === 'account') body.sourceAccount = data.sourceId;
        if (data.targetType === 'account') body.targetAccount = data.targetId;
        if (data.sourceType === 'customer') body.customer = data.sourceId;
        if (data.targetType === 'customer') body.customer = data.targetId;
        if (data.sourceType === 'supplier') body.supplier = data.sourceId;
        if (data.targetType === 'supplier') body.supplier = data.targetId;
        await api.post('/transactions/transfer', body);
      } else {
        // Cari → Cari transfer desteklenmiyor
        return;
      }
      setToast({ open: true, message: 'Transfer başarılı', severity: 'success' });
      fetchAccounts && fetchAccounts();
      fetchCustomers && fetchCustomers();
      setTransferOpen(false);
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.msg || 'Transfer başarısız', severity: 'error' });
    }
  };

  const handleExportCSV = () => {
    // Array kontrolü ekle
    const customersArray = Array.isArray(customers) ? customers : [];
    
    const filteredCustomers = customersArray.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    );
    
    const csvData = unparse(filteredCustomers, {
      columns: ["name", "email", "phone", "address"],
      header: true,
    });
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'musteriler.csv');
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
          <People />
          Müşteriler
        </Typography>
      </Box>

      <CustomerFilters 
        search={search} 
        onSearchChange={setSearch} 
      />

      <CustomerActions
        onNewCustomer={() => handleOpen()}
        onExportCsv={handleExportCSV}
      />

      <CustomerTable
        customers={customers}
        search={search}
        onEdit={handleOpen}
        onDelete={handleDelete}
        onViewDetail={handleDetailOpen}
        onOpenTransfer={handleTransferOpen}
      />

      <CustomerForm
        open={open}
        onClose={handleClose}
        onSave={handleSaveCustomer}
        form={form}
        onFormChange={handleChange}
        editCustomer={editCustomer}
      />

      {/* Transfer Dialog ve diğer dialog'lar için geçici placeholder */}
      <TransferDialog 
        open={transferOpen} 
        onClose={() => setTransferOpen(false)} 
        onSubmit={handleTransferSubmit}
        accounts={accounts}
        customers={allCustomers}
        suppliers={[]}
      />
      
      <Toast {...toast} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}

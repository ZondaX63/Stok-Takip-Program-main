import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import AccountSearchBar from '../components/accounts/AccountSearchBar';
import AccountGroup from '../components/accounts/AccountGroup';
import AccountForm from '../components/accounts/AccountForm';
import AccountDetail from '../components/accounts/AccountDetail';
import AccountDeleteDialog from '../components/accounts/AccountDeleteDialog';
import api from '../api';
import Toast from '../components/Toast';
import TransferDialog from '../components/accounts/TransferDialog';
import { AppContext } from '../contexts/AppContext';

export default function AccountDashboard() {
  const { triggerRefresh } = useContext(AppContext);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'cash', balance: 0, currency: 'TRY', cariType: '', email: '', phone: '', address: '' });
  const [, setFormGroup] = useState('company');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferSource, setTransferSource] = useState(null);
  const [undoAccount, setUndoAccount] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch {
      setToast({ open: true, message: 'Hesaplar alınamadı', severity: 'error' });
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // Filtrelenmiş ve aranan hesaplar
  const filtered = accounts.filter(acc => {
    if (filter === 'company') return ['cash', 'bank', 'credit_card', 'personnel'].includes(acc.type);
    if (filter === 'customer') return acc.type === 'cari' && acc.cariType === 'customer';
    if (filter === 'supplier') return acc.type === 'cari' && acc.cariType === 'supplier';
    return true;
  }).filter(acc => acc.name.toLowerCase().includes(search.toLowerCase()));

  // Gruplar
  const companyAccounts = filtered.filter(acc => ['cash', 'bank', 'credit_card', 'personnel'].includes(acc.type));
  const customerAccounts = filtered.filter(acc => acc.type === 'cari' && acc.cariType === 'customer');
  const supplierAccounts = filtered.filter(acc => acc.type === 'cari' && acc.cariType === 'supplier');

  // Tüm hesapların toplamı
  const grandTotal = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // Hızlı ekleme
  const handleQuickAdd = group => {
    setFormGroup(group);
    setFormData({ name: '', type: group === 'company' ? 'cash' : 'cari', balance: 0, currency: 'TRY', cariType: group === 'customer' ? 'customer' : group === 'supplier' ? 'supplier' : '', email: '', phone: '', address: '' });
    setIsEdit(false);
    setFormOpen(true);
  };
  const handleEdit = acc => {
    setFormData({ ...acc });
    setIsEdit(true);
    setFormOpen(true);
  };
  const handleDelete = acc => {
    setSelectedAccount(acc);
    setDeleteOpen(true);
  };
  const handleDetail = acc => {
    setSelectedAccount(acc);
    setDetailOpen(true);
  };
  const handleFormChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFormSave = async () => {
    if (formData.type === 'cari' && (!formData.cariType || !formData.email)) {
      setToast({ open: true, message: 'Cari hesap için tür ve e-posta zorunlu.', severity: 'error' });
      return;
    }
    try {
      if (isEdit) {
        await api.put(`/accounts/${formData._id}`, formData);
        setToast({ open: true, message: 'Hesap güncellendi', severity: 'success' });
      } else {
        await api.post('/accounts', formData);
        setToast({ open: true, message: 'Hesap eklendi', severity: 'success' });
        
        // Eğer cari hesap oluşturulduysa, ilgili sayfaları yenile
        if (formData.type === 'cari') {
          if (formData.cariType === 'customer') {
            triggerRefresh('customers');
          } else if (formData.cariType === 'supplier') {
            triggerRefresh('suppliers');
          }
        }
      }
      setFormOpen(false);
      fetchAccounts();
      triggerRefresh('accounts');
    } catch {
      setToast({ open: true, message: 'Hesap kaydedilemedi', severity: 'error' });
    }
  };
  const handleDeleteConfirm = async () => {
    try {
      const accountToDelete = selectedAccount;
      setUndoAccount(accountToDelete);
      await api.delete(`/accounts/${accountToDelete._id}`);
      setToast({ open: true, message: 'Hesap silindi', severity: 'success' });
      setDeleteOpen(false);
      fetchAccounts();
      
      // Cari hesap silindiyse ilgili sayfaları yenile
      if (accountToDelete.type === 'cari') {
        if (accountToDelete.cariType === 'customer') {
          triggerRefresh('customers');
        } else if (accountToDelete.cariType === 'supplier') {
          triggerRefresh('suppliers');
        }
      }
      triggerRefresh('accounts');
    } catch {
      setToast({ open: true, message: 'Hesap silinemedi', severity: 'error' });
    }
  };
  const handleUndo = async (acc) => {
    if (!acc) return;
    const { _id, ...rest } = acc;
    try {
      await api.post('/accounts', rest);
      setToast({ open: true, message: 'Silinen hesap geri alındı', severity: 'success' });
      fetchAccounts();
      
      // Cari hesap geri alındıysa ilgili sayfaları yenile
      if (acc.type === 'cari') {
        if (acc.cariType === 'customer') {
          triggerRefresh('customers');
        } else if (acc.cariType === 'supplier') {
          triggerRefresh('suppliers');
        }
      }
      triggerRefresh('accounts');
    } catch {
      setToast({ open: true, message: 'Geri alma başarısız', severity: 'error' });
    }
    setUndoAccount(null);
  };

  // Transfer işlemi
  const handleTransfer = acc => {
    setTransferSource(acc);
    setTransferOpen(true);
  };
  const handleTransferSubmit = async (data) => {
    // Transfer işlemini API'ye gönder
    try {
      await api.post('/accounts/transfer', data);
      setToast({ open: true, message: 'Transfer başarılı', severity: 'success' });
      setTransferOpen(false);
      fetchAccounts();
    } catch {
      setToast({ open: true, message: 'Transfer başarısız', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Hesaplar</Typography>
      <Typography variant="h6" sx={{ color: grandTotal > 0 ? 'success.main' : grandTotal < 0 ? 'error.main' : 'text.primary', mb: 2, fontWeight: 700 }}>
        Toplam Bakiye: {grandTotal.toLocaleString('tr-TR')} TL
      </Typography>
      <AccountSearchBar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
      <Divider sx={{ my: 2 }} />
      {filter === 'all' && (
        <>
          <AccountGroup title="Şirket Hesapları" accounts={companyAccounts} onAdd={() => handleQuickAdd('company')} onEdit={handleEdit} onDelete={handleDelete} onDetail={handleDetail} onTransfer={handleTransfer} />
          <AccountGroup title="Müşteri Hesapları" accounts={customerAccounts} onAdd={() => handleQuickAdd('customer')} onEdit={handleEdit} onDelete={handleDelete} onDetail={handleDetail} onTransfer={handleTransfer} />
          <AccountGroup title="Tedarikçi Hesapları" accounts={supplierAccounts} onAdd={() => handleQuickAdd('supplier')} onEdit={handleEdit} onDelete={handleDelete} onDetail={handleDetail} onTransfer={handleTransfer} />
        </>
      )}
      {filter === 'company' && (
        <AccountGroup title="Şirket Hesapları" accounts={companyAccounts} onAdd={() => handleQuickAdd('company')} onEdit={handleEdit} onDelete={handleDelete} onDetail={handleDetail} onTransfer={handleTransfer} />
      )}
      {filter === 'customer' && (
        <AccountGroup title="Müşteri Hesapları" accounts={customerAccounts} onAdd={() => handleQuickAdd('customer')} onEdit={handleEdit} onDelete={handleDelete} onDetail={handleDetail} onTransfer={handleTransfer} />
      )}
      {filter === 'supplier' && (
        <AccountGroup title="Tedarikçi Hesapları" accounts={supplierAccounts} onAdd={() => handleQuickAdd('supplier')} onEdit={handleEdit} onDelete={handleDelete} onDetail={handleDetail} onTransfer={handleTransfer} />
      )}
      <AccountForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleFormSave} form={formData} onChange={handleFormChange} />
      <TransferDialog open={transferOpen} onClose={() => setTransferOpen(false)} source={transferSource} onSubmit={handleTransferSubmit} accounts={accounts} />
      <AccountDetail open={detailOpen} onClose={() => setDetailOpen(false)} account={selectedAccount} />
      <AccountDeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onDelete={handleDeleteConfirm} account={selectedAccount} onUndo={handleUndo} undoAccount={undoAccount} />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
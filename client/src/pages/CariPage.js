import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import api from '../api';
import Toast from '../components/Toast';
import { unparse } from 'papaparse';
import CariStats from '../components/cari/CariStats';
import CariFilters from '../components/cari/CariFilters';
import CariTable from '../components/cari/CariTable';
import CariForm from '../components/cari/CariForm';
import CariDetailDialog from '../components/cari/CariDetailDialog';

export default function CariPage() {
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
    const [selectedType, setSelectedType] = useState(null); // null = all, 'customer' = customers only, 'supplier' = suppliers only
    
    // Combined state for all partners
    const [partners, setPartners] = useState([]);
    const [stats, setStats] = useState({ customers: 0, suppliers: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [sort, setSort] = useState({ field: 'name', order: 'asc' });
    const [search, setSearch] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editingType, setEditingType] = useState('customer');

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedCari, setSelectedCari] = useState(null);
    const [detailTab, setDetailTab] = useState(0);
    const [cariTransactions, setCariTransactions] = useState([]);
    const [cariSummary, setCariSummary] = useState(null);
    const [quickTx, setQuickTx] = useState({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    const [quickTxLoading, setQuickTxLoading] = useState(false);
    const [note, setNote] = useState('');

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        try {
            const params = { 
                page, 
                limit: 10, 
                sort: sort.field, 
                order: sort.order, 
                search,
                type: selectedType
            };
            const [customerRes, supplierRes] = await Promise.all([
                api.get('/customers', { params: selectedType === 'supplier' ? { limit: 0 } : params }),
                api.get('/suppliers', { params: selectedType === 'customer' ? { limit: 0 } : params })
            ]);
            
            const customers = (customerRes.data.customers || customerRes.data.docs || []).map(c => ({ ...c, type: 'customer' }));
            const suppliers = (supplierRes.data.suppliers || supplierRes.data.docs || []).map(s => ({ ...s, type: 'supplier' }));
            
            if (selectedType === 'customer') {
                setPartners(customers);
                setTotalPages(customerRes.data.totalPages || 0);
            } else if (selectedType === 'supplier') {
                setPartners(suppliers);
                setTotalPages(supplierRes.data.totalPages || 0);
            } else {
                // Show all - combine and paginate manually
                const allPartners = [...customers, ...suppliers];
                const filteredPartners = allPartners.filter(partner => 
                    partner.name.toLowerCase().includes(search.toLowerCase())
                );
                const sortedPartners = filteredPartners.sort((a, b) => {
                    const aVal = a[sort.field] || '';
                    const bVal = b[sort.field] || '';
                    return sort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                });
                const startIndex = (page - 1) * 10;
                setPartners(sortedPartners.slice(startIndex, startIndex + 10));
                setTotalPages(Math.ceil(sortedPartners.length / 10));
            }
            
            setStats({
                customers: customerRes.data.totalDocs || customers.length,
                suppliers: supplierRes.data.totalDocs || suppliers.length
            });
        } catch (err) {
            setToast({ open: true, message: 'Veriler yüklenemedi.', type: 'error' });
        }
        setLoading(false);
    }, [page, sort, search, selectedType]);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    const handleSort = (field) => {
        const isAsc = sort.field === field && sort.order === 'asc';
        setSort({ field, order: isAsc ? 'desc' : 'asc' });
        setPage(1);
    };

    const handleStatCardClick = (type) => {
        setSelectedType(selectedType === type ? null : type);
        setPage(1);
    };

    const handleExport = async () => {
        const filename = selectedType === 'customer' ? 'musteriler.csv' : selectedType === 'supplier' ? 'tedarikciler.csv' : 'tum-veriler.csv';
        const fields = selectedType === 'customer' ? ["name", "email", "phone", "address"] : selectedType === 'supplier' ? ["name", "contactPerson", "email", "phone", "address"] : ["name", "email", "phone", "address"];

        setToast({ open: true, message: 'Veriler dışa aktarılıyor...', type: 'info' });
        try {
            const res = await api.get('/partners', { params: { limit: 0, sort: sort.field, order: sort.order, search } });
            const dataToExport = res.data.docs;
            const csv = unparse(dataToExport, { fields, header: true });
            const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            setToast({ open: true, message: 'Dışa aktarma başarısız oldu.', type: 'error' });
        }
    };

    const handleDialogOpen = (row = null) => {
        setIsEdit(!!row);
        setEditingId(row?._id || null);
        setEditingType(row?.type || 'customer');
        if (row) {
            setFormData({
                name: row.name || '',
                email: row.email || '',
                phone: row.phone || '',
                address: row.address || '',
                contactPerson: row.contactPerson || '',
                type: row.type || 'customer'
            });
        } else {
            setFormData({ name: '', email: '', phone: '', address: '', contactPerson: '', type: 'customer' });
        }
        setDialogOpen(true);
    };
    const handleDialogClose = () => {
        setDialogOpen(false);
        setFormData({});
        setEditingId(null);
        setEditingType('customer');
    };
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleFormSubmit = async () => {
        try {
            const type = isEdit ? editingType : formData.type;
            if (type === 'customer') {
                if (isEdit) {
                    await api.put(`/customers/${editingId}`, formData);
                } else {
                    await api.post('/customers', formData);
                }
            } else if (type === 'supplier') {
                if (isEdit) {
                    await api.put(`/suppliers/${editingId}`, formData);
                } else {
                    await api.post('/suppliers', formData);
                }
            }
            fetchPartners();
            setToast({ open: true, message: isEdit ? 'Güncellendi' : 'Eklendi', type: 'success' });
            handleDialogClose();
        } catch (err) {
            setToast({ open: true, message: 'İşlem başarısız', type: 'error' });
        }
    };

    const handleDetailOpen = async (row) => {
        setSelectedCari(row);
        setDetailOpen(true);
        setDetailTab(0);
        // API'den ekstre ve özet çek
        try {
            const res = await api.get(`/${row.type === 'customer' ? 'customers' : 'suppliers'}/${row._id}`);
            setCariSummary(res.data);
            setCariTransactions(res.data.invoices || []);
        } catch {}
    };
    const handleDetailClose = () => { setDetailOpen(false); setSelectedCari(null); setCariSummary(null); setCariTransactions([]); };

    const handleQuickTransaction = async () => {
        if (!quickTx.amount || !quickTx.description) {
            setToast({ open: true, message: 'Lütfen tüm alanları doldurun.', severity: 'warning' });
            return;
        }

        setQuickTxLoading(true);
        try {
            await api.post('/transactions', quickTx);
            setToast({ open: true, message: 'Hızlı işlem eklendi.', severity: 'success' });
            fetchPartners();
        } catch {
            setToast({ open: true, message: 'İşlem başarısız oldu.', severity: 'error' });
        } finally {
            setQuickTxLoading(false);
        }
    };

    const handleQuickTxSave = async () => {
        if (!quickTx.amount || !quickTx.description) {
            setToast({ open: true, message: 'Lütfen tüm alanları doldurun.', severity: 'warning' });
            return;
        }

        setQuickTxLoading(true);
        try {
            await api.post('/transactions', quickTx);
            setToast({ open: true, message: 'Hızlı işlem eklendi.', severity: 'success' });
            fetchPartners();
        } catch {
            setToast({ open: true, message: 'İşlem başarısız oldu.', severity: 'error' });
        } finally {
            setQuickTxLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchPartners();
    };

    return (
        <Box sx={{ p: 3 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <CariStats 
                        stats={stats}
                        selectedType={selectedType}
                        onStatCardClick={handleStatCardClick}
                    />
                    
                    <CariFilters 
                        search={search}
                        onSearchChange={setSearch}
                        onExport={handleExport}
                        onAdd={() => handleDialogOpen()}
                    />
                    
                    <CariTable 
                        partners={partners}
                        sort={sort}
                        onSort={handleSort}
                        onEdit={handleDialogOpen}
                        onDetail={handleDetailOpen}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                </>
            )}
            
            <CariForm 
                open={dialogOpen}
                onClose={handleDialogClose}
                isEdit={isEdit}
                formData={formData}
                onFormChange={handleFormChange}
                onSave={handleFormSubmit}
                editingType={editingType}
                onTypeChange={(type) => setFormData({ ...formData, type })}
            />
            
            <CariDetailDialog 
                open={detailOpen}
                onClose={handleDetailClose}
                selectedCari={selectedCari}
                detailTab={detailTab}
                onDetailTabChange={(_, v) => setDetailTab(v)}
                cariTransactions={cariTransactions}
                cariSummary={cariSummary}
                quickTx={quickTx}
                onQuickTxChange={(e) => setQuickTx({ ...quickTx, [e.target.name]: e.target.value })}
                onQuickTxSubmit={handleQuickTxSave}
                quickTxLoading={quickTxLoading}
                note={note}
                onNoteChange={(e) => setNote(e.target.value)}
                onNoteSave={() => {}} // Not kaydetme fonksiyonu eklenebilir
            />
            
            <Toast {...toast} onClose={() => setToast({ ...toast, open: false })} />
        </Box>
    );
}
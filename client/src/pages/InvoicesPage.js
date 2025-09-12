import React, { useState, useEffect } from 'react';
import {
    Box, Pagination, useTheme, useMediaQuery, CircularProgress
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

import Toast from '../components/Toast';
import { AppBox, AppTitle } from '../components/Styled';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoicePaymentDialog from '../components/invoices/InvoicePaymentDialog';
import InvoiceStats from '../components/invoices/InvoiceStats';
import InvoiceFilters from '../components/invoices/InvoiceFilters';
import InvoiceActions from '../components/invoices/InvoiceActions';
import InvoiceTable from '../components/invoices/InvoiceTable';
import api from '../api';

import { useInvoices } from '../hooks/useInvoices';
import { useCustomersAndSuppliers } from '../hooks/useCustomersAndSuppliers';
import { 
    exportInvoicesToCsv, 
    exportInvoicesToPdf, 
    generateInvoicePdf,
    getStatusTransitions
} from '../utils/invoiceUtils';

const InvoicesPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // Custom hooks
    const {
        invoices,
        loading,
        searchTerm,
        filters,
        sort,
        page,
        totalPages,
        setSearchTerm,
        setFilters,
        setSort,
        setPage,
        createInvoice,
        updateInvoice,
        deleteInvoice,
    fetchInvoices,
        updateInvoiceStatus,
        duplicateInvoice,
        getInvoiceStats
    } = useInvoices();

    const { customers, suppliers } = useCustomersAndSuppliers();

    // Local state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
    const [loadingForm, setLoadingForm] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState(null);
    const [accounts, setAccounts] = useState([]);
    
    // Invoice form state
    const [form, setForm] = useState({
        invoiceNumber: '',
        type: 'sale',
        customerOrSupplier: '',
        currency: 'TRY',
        date: new Date(),
        dueDate: null,
        description: ''
    });
    const [productRows, setProductRows] = useState([{
        product: '',
        quantity: 1,
        purchasePrice: 0,
        salePrice: 0,
        vat: 18
    }]);
    const [products, setProducts] = useState([]);

    // Event handlers
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleSortChange = (field) => {
        const isAsc = sort.field === field && sort.order === 'asc';
        setSort({ field, order: isAsc ? 'desc' : 'asc' });
    };

    const handleOpen = (invoice = null) => {
        setSelectedInvoice(invoice);
        if (invoice) {
            // Edit mode - populate form with invoice data
            setForm({
                invoiceNumber: invoice.invoiceNumber || '',
                type: invoice.type || 'sale',
                // API returns customerOrSupplier populated with name (and _id)
                customerOrSupplier: invoice.customerOrSupplier?._id || invoice.customerOrSupplier || '',
                currency: invoice.currency || 'TRY',
                date: invoice.date ? new Date(invoice.date) : new Date(),
                dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
                description: invoice.description || ''
            });
            // Map backend products -> UI rows
            const mappedRows = (invoice.products || []).map((it) => ({
                product: it.product?._id || it.product,
                quantity: it.quantity || 1,
                purchasePrice: it.purchasePrice ?? it.price ?? 0,
                salePrice: it.salePrice ?? it.price ?? 0,
                vat: it.vat ?? 0,
            }));
            setProductRows(mappedRows.length ? mappedRows : [{
                product: '',
                quantity: 1,
                purchasePrice: 0,
                salePrice: 0,
                vat: 18
            }]);
        } else {
            // New invoice mode - reset form
            setForm({
                invoiceNumber: '',
                type: 'sale',
                customerOrSupplier: '',
                currency: 'TRY',
                date: new Date(),
                dueDate: null,
                description: ''
            });
            setProductRows([{
                product: '',
                quantity: 1,
                purchasePrice: 0,
                salePrice: 0,
                vat: 18
            }]);
        }
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setSelectedInvoice(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleProductRowChange = (index, field, value) => {
        setProductRows(prev => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], [field]: value };
            
            // Auto-fill prices when product is selected
            if (field === 'product' && value) {
                const product = products.find(p => p._id === value);
                if (product) {
                    newRows[index].purchasePrice = product.purchasePrice || 0;
                    newRows[index].salePrice = product.salePrice || 0;
                }
            }
            
            return newRows;
        });
    };

    const handleAddProductRow = (index) => {
        setProductRows(prev => {
            const newRows = [...prev];
            newRows.splice(index + 1, 0, {
                product: '',
                quantity: 1,
                purchasePrice: 0,
                salePrice: 0,
                vat: 18
            });
            return newRows;
        });
    };

    const handleRemoveProductRow = (index) => {
        if (productRows.length > 1) {
            setProductRows(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSave = async (formData, productRows) => {
        let result;
        if (selectedInvoice) {
            result = await updateInvoice(selectedInvoice._id, formData, productRows);
        } else {
            result = await createInvoice(formData, productRows);
        }

        if (result.success) {
            setToast({ 
                open: true, 
                message: selectedInvoice ? 'Fatura güncellendi' : 'Fatura oluşturuldu', 
                type: 'success' 
            });
            handleClose();
        } else {
            setToast({ open: true, message: result.error, type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu faturayı silmek istediğinizden emin misiniz?')) {
            const result = await deleteInvoice(id);
            if (result.success) {
                setToast({ open: true, message: 'Fatura silindi', type: 'success' });
            } else {
                setToast({ open: true, message: result.error, type: 'error' });
            }
        }
    };

    // (moved) handleStatusChange is implemented below to support approve/revert/payment flows

    const handleDuplicate = async (invoice) => {
        const result = await duplicateInvoice(invoice);
        if (result.success) {
            setToast({ open: true, message: 'Fatura kopyalandı', type: 'success' });
        } else {
            setToast({ open: true, message: result.error, type: 'error' });
        }
    };

    const handleExportCsv = async () => {
        setToast({ open: true, message: 'CSV hazırlanıyor...', type: 'info' });
        const result = await exportInvoicesToCsv({
            search: searchTerm,
            ...filters,
            sort: sort.field,
            order: sort.order
        });

        if (result.success) {
            setToast({ open: true, message: 'CSV başarıyla dışa aktarıldı', type: 'success' });
        } else {
            setToast({ open: true, message: 'CSV dışa aktarılamadı', type: 'error' });
        }
    };

    const handleExportPdf = async () => {
        setToast({ open: true, message: 'PDF hazırlanıyor...', type: 'info' });
        const result = await exportInvoicesToPdf({
            search: searchTerm,
            ...filters,
            sort: sort.field,
            order: sort.order
        });

        if (result.success) {
            setToast({ open: true, message: 'PDF başarıyla dışa aktarıldı', type: 'success' });
        } else {
            setToast({ open: true, message: 'PDF dışa aktarılamadı', type: 'error' });
        }
    };

    const handleViewPdf = (invoice) => {
        const result = generateInvoicePdf(invoice);
        if (!result.success) {
            setToast({ open: true, message: 'PDF oluşturulamadı', type: 'error' });
        }
    };

    const stats = getInvoiceStats();
    const statusTransitions = getStatusTransitions();

    // Fetch products for invoice form
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data.products || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    // Preload accounts for payment dialog
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get('/accounts');
                setAccounts(res.data || []);
            } catch (e) {
                setAccounts([]);
            }
        };
        fetchAccounts();
    }, []);

    const getStatusTransition = (currentStatus, direction = 'next') => {
        const transition = statusTransitions[currentStatus];
        if (!transition) return null;
        
        if (direction === 'next') {
            return transition.next ? {
                status: transition.next,
                label: transition.nextLabel,
                icon: transition.nextIcon,
                color: transition.nextColor
            } : null;
        } else {
            return transition.prev ? {
                status: transition.prev,
                label: transition.prevLabel,
                icon: transition.prevIcon,
                color: transition.prevColor
            } : null;
        }
    };

    const handleSaveInvoice = async () => {
        if (!form.customerOrSupplier || !productRows.length) {
            setToast({ open: true, message: 'Lütfen müşteri ve ürün bilgilerini doldurun.', type: 'warning' });
            return;
        }

        // Determine partnerModel from selected partner
        const isCustomer = (customers || []).some(c => c._id === form.customerOrSupplier);
        const isSupplier = (suppliers || []).some(s => s._id === form.customerOrSupplier);
        const partnerModel = isCustomer ? 'Customer' : (isSupplier ? 'Supplier' : null);
        if (!partnerModel) {
            setToast({ open: true, message: 'Geçerli bir müşteri/tedarikçi seçin.', type: 'error' });
            return;
        }

        // Map product rows to API shape
        const productsPayload = productRows.map(r => ({
            product: r.product,
            quantity: Number(r.quantity) || 0,
            price: Number(form.type === 'sale' ? r.salePrice : r.purchasePrice) || 0,
            purchasePrice: Number(r.purchasePrice) || 0,
            salePrice: Number(r.salePrice) || 0,
            vat: Number(r.vat) || 0,
            discount1: Number(r.discount1) || 0,
            discount2: Number(r.discount2) || 0,
            discount3: Number(r.discount3) || 0,
            discount4: Number(r.discount4) || 0,
        }));

        // Compute totals (net + VAT)
        const subTotal = productsPayload.reduce((sum, it) => sum + (it.quantity * it.price), 0);
        const totalVat = productsPayload.reduce((sum, it) => sum + ((it.quantity * it.price) * (it.vat || 0) / 100), 0);
        const totalAmount = subTotal + totalVat;

        const payload = {
            invoiceNumber: form.invoiceNumber,
            customerOrSupplier: form.customerOrSupplier,
            partnerModel,
            products: productsPayload,
            totalAmount,
            type: form.type,
            date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
            dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
            vat: 0,
            discount1: 0,
            discount2: 0,
            discount3: 0,
            discount4: 0,
        };

        setLoadingForm(true);
        try {
            let result;
            if (selectedInvoice) {
                result = await updateInvoice(selectedInvoice._id, payload);
            } else {
                result = await createInvoice(payload);
            }
            if (result?.success) {
                setToast({ open: true, message: selectedInvoice ? 'Fatura güncellendi.' : 'Fatura eklendi.', type: 'success' });
                handleClose();
            } else {
                setToast({ open: true, message: result?.error || 'İşlem başarısız oldu.', type: 'error' });
            }
        } catch (e) {
            setToast({ open: true, message: 'İşlem başarısız oldu.', type: 'error' });
        } finally {
            setLoadingForm(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            if (newStatus === 'approved') {
                // Approve to trigger stock movements
                const res = await api.post(`/invoices/${id}/approve`);
                if (res.status === 200) {
                    setToast({ open: true, message: 'Fatura onaylandı ve stok güncellendi', type: 'success' });
                    // refresh
                    await fetchInvoices();
                }
                return;
            }
            if (newStatus === 'paid') {
                // Open payment dialog to select account and amount
                const inv = invoices.find(x => x._id === id);
                setPaymentInvoice(inv || null);
                setPaymentOpen(true);
                return;
            }
            if (newStatus === 'draft') {
                // Revert to draft (admin only)
                const res = await api.post(`/invoices/${id}/revert`);
                if (res.status === 200) {
                    setToast({ open: true, message: 'Fatura taslağa çevrildi ve stok geri alındı', type: 'success' });
                    await fetchInvoices();
                }
                return;
            }
            // Fallback to generic status update (e.g., canceled)
            const result = await updateInvoiceStatus(id, newStatus);
            if (result.success) {
                setToast({ open: true, message: 'Fatura durumu güncellendi', type: 'success' });
            } else {
                setToast({ open: true, message: result.error, type: 'error' });
            }
        } catch (err) {
            setToast({ open: true, message: err?.response?.data?.msg || 'İşlem başarısız', type: 'error' });
        }
    };

    const handlePaymentSubmit = async ({ amount, accountId, description }) => {
        if (!paymentInvoice) return;
        try {
            if (paymentInvoice.type === 'sale') {
                // Tahsilat
                await api.post(`/invoices/${paymentInvoice._id}/collect`, { amount, accountId });
            } else {
                // Ödeme (alış faturası)
                await api.post(`/invoices/${paymentInvoice._id}/pay`, { amount, accountId, description });
            }
            setToast({ open: true, message: 'İşlem başarılı', type: 'success' });
            setPaymentOpen(false);
            setPaymentInvoice(null);
            await fetchInvoices();
        } catch (e) {
            setToast({ open: true, message: e?.response?.data?.msg || 'Ödeme/Tahsilat sırasında hata', type: 'error' });
        }
    };

    if (loading && invoices.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <AppBox>
                <AppTitle variant="h4" gutterBottom>
                    <Receipt sx={{ mr: 2, verticalAlign: 'middle' }} />
                    Fatura Yönetimi
                </AppTitle>

                {/* Stats Cards */}
                <InvoiceStats stats={stats} />

                {/* Filters and Actions */}
                <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row', 
                    gap: 2, 
                    alignItems: isMobile ? 'stretch' : 'center' 
                }}>
                    <InvoiceFilters
                        searchTerm={searchTerm}
                        filters={filters}
                        onSearchChange={handleSearchChange}
                        onFiltersChange={setFilters}
                    />
                    <InvoiceActions
                        onNewInvoice={() => handleOpen()}
                        onExportCsv={handleExportCsv}
                        onExportPdf={handleExportPdf}
                    />
                </Box>

                {/* Invoices Table */}
                <InvoiceTable
                    invoices={invoices}
                    sort={sort}
                    onSortChange={handleSortChange}
                    onEdit={handleOpen}
                    onDelete={handleDelete}
                    onViewPdf={handleViewPdf}
                    onDuplicate={handleDuplicate}
                    onStatusChange={handleStatusChange}
                    getStatusTransition={getStatusTransition}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                )}

                {/* Invoice Form Dialog */}
                <InvoiceForm
                    open={dialogOpen}
                    onClose={handleClose}
                    onSave={handleSaveInvoice}
                    invoice={selectedInvoice}
                    customers={customers}
                    suppliers={suppliers}
                    products={products}
                    form={form}
                    productRows={productRows}
                    onFormChange={handleFormChange}
                    onProductRowChange={handleProductRowChange}
                    onAddProductRow={handleAddProductRow}
                    onRemoveProductRow={handleRemoveProductRow}
                    loading={loadingForm}
                />

                {/* Payment/Tahsilat Dialog */}
                <InvoicePaymentDialog
                    open={paymentOpen}
                    onClose={() => { setPaymentOpen(false); setPaymentInvoice(null); }}
                    onSubmit={handlePaymentSubmit}
                    invoice={paymentInvoice}
                    accounts={accounts}
                />

                {/* Toast Notification */}
                <Toast
                    open={toast.open}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, open: false })}
                />
            </AppBox>
        </LocalizationProvider>
    );
};

export default InvoicesPage;

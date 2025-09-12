import React, { useState, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, TextField, InputAdornment, CircularProgress, 
    Tabs, Tab, Select, MenuItem, InputLabel, FormControl, Chip, 
    Pagination, Tooltip, TableSortLabel, LinearProgress, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, useTheme, useMediaQuery,
    FormControlLabel, Checkbox, IconButton
} from '@mui/material';
import { Add, Edit, Delete, Search, Inventory, Warning, Store, Download, Timeline, Info, Upload } from '@mui/icons-material';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import ProductFormDialog from '../components/ProductFormDialog';
import { AppBox, AppTitle} from '../components/Styled';
import ProductLogPanel from '../components/ProductLogPanel';
import { useProducts } from '../hooks/useProducts';
import { useCategoriesAndBrands } from '../hooks/useCategoriesAndBrands';
import { exportProductsToCsv, exportLowStockToCsv, importStockCountFromCsv } from '../utils/csvUtils';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const getStockStatusColor = (quantity, criticalStock) => {
    if (quantity <= criticalStock) return 'error';
    if (quantity <= criticalStock * 1.5) return 'warning';
    return 'success';
};

const headCells = [
    { id: 'select', label: '', width: 50 },
    { id: 'name', label: 'Ürün Adı' },
    { id: 'oem', label: 'OEM' },
    { id: 'sku', label: 'SKU' },
    { id: 'quantity', label: 'Stok' },
    { id: 'salePrice', label: 'Satış Fiyatı' },
    { id: 'actions', label: 'İşlemler' },
];

const ProductsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // Custom hooks
    const {
        products,
        loading,
        searchTerm,
        filters,
        sort,
        page,
        totalPages,
        totalProducts,
        setSearchTerm,
        setFilters,
        setSort,
        setPage,
        fetchData,
        deleteProduct,
        createProduct,
        updateProduct
    } = useProducts();

    const {
        categories,
        brands,
        loading: categoriesBrandsLoading,
        createCategory,
        createBrand
    } = useCategoriesAndBrands();

    // Local state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [selectedProductForLog, setSelectedProductForLog] = useState(null);
    // Bulk operations state
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    // Additional state for UI
    const [dialogLoading, setDialogLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
    const [loadingExport, setLoadingExport] = useState(false);
    // Advanced search state
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [showOemGroups, setShowOemGroups] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Optimized event handlers with useCallback
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1);

        // Sadece öneriler için (debouncing olmadan)
        if (value && value.trim().length >= 3) {
            // Önerileri hemen getir (debouncing olmadan)
            fetchSuggestions(value);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    }, [setSearchTerm, setPage]);

    // Önerileri getiren ayrı fonksiyon
    const fetchSuggestions = useCallback(async (searchValue) => {
        try {
            const response = await fetch(`/api/search/products/suggestions?q=${encodeURIComponent(searchValue)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setSearchSuggestions(data.suggestions);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Öneri getirme hatası:', error);
        }
    }, []);

    const handleAdvancedSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length === 0) {
            setSearchResults(null);
            setShowOemGroups(false);
            return;
        }

        setSearchLoading(true);
        try {
            const response = await fetch(`/api/search/products?q=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setSearchResults(data);
                setShowOemGroups(data.isOemGroupSearch && data.groupedResults.length > 0);
                
                if (data.isOemGroupSearch) {
                    setToast({
                        open: true,
                        message: `${data.totalResults} ürün bulundu (${data.groupedResults.length} OEM grubu)`,
                        type: 'info'
                    });
                }
            }
        } catch (error) {
            console.error('Gelişmiş arama hatası:', error);
            setToast({
                open: true,
                message: 'Arama sırasında bir hata oluştu',
                type: 'error'
            });
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSuggestionClick = useCallback((suggestion) => {
        setSearchTerm(suggestion.value);
        setShowSuggestions(false);
        handleAdvancedSearch(suggestion.value);
    }, [handleAdvancedSearch]);

    const handleSortChange = useCallback((field) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    }, [setSort]);

    const handleOpen = useCallback((product = null) => {
        setSelectedProduct(product);
        setDialogOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setDialogOpen(false);
        setSelectedProduct(null);
    }, []);

    const handleSave = useCallback(async (productData) => {
        setDialogLoading(true);
        try {
            let result;
            if (selectedProduct) {
                result = await updateProduct(selectedProduct._id, productData);
            } else {
                result = await createProduct(productData);
            }

            if (result.success) {
                setToast({ 
                    open: true, 
                    message: selectedProduct ? 'Ürün güncellendi' : 'Ürün oluşturuldu', 
                    type: 'success' 
                });
                handleClose();
                fetchData(); // Refresh data
            } else {
                setToast({ open: true, message: result.error, type: 'error' });
            }
        } catch (error) {
            setToast({ open: true, message: 'Bir hata oluştu', type: 'error' });
        } finally {
            setDialogLoading(false);
        }
    }, [selectedProduct, updateProduct, createProduct, handleClose, fetchData]);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProduct(id);
                setToast({ open: true, message: 'Ürün silindi', type: 'success' });
                fetchData(); // Refresh data
            } catch (error) {
                setToast({ open: true, message: 'Ürün silinemedi', type: 'error' });
            }
        }
    }, [deleteProduct, fetchData]);

    // Bulk operations handlers
    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            setSelectedProducts(products.map(p => p._id));
        } else {
            setSelectedProducts([]);
        }
    }, [products]);

    const handleSelectProduct = useCallback((productId, checked) => {
        if (checked) {
            setSelectedProducts(prev => [...prev, productId]);
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
    }, []);

    const handleBulkDelete = useCallback(async () => {
        if (selectedProducts.length === 0) return;
        
        if (window.confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`)) {
            setBulkActionLoading(true);
            try {
                // Delete selected products
                await Promise.all(selectedProducts.map(id => deleteProduct(id)));
                setToast({ 
                    open: true, 
                    message: `${selectedProducts.length} ürün başarıyla silindi`, 
                    type: 'success' 
                });
                setSelectedProducts([]);
                fetchData();
            } catch (error) {
                setToast({ open: true, message: 'Toplu silme işlemi başarısız', type: 'error' });
            } finally {
                setBulkActionLoading(false);
            }
        }
    }, [selectedProducts, deleteProduct, fetchData]);

    const handleBulkExport = useCallback(async () => {
        if (selectedProducts.length === 0) return;
        
        setBulkActionLoading(true);
        try {
            // Export selected products
            const selectedProductsData = products.filter(p => selectedProducts.includes(p._id));
            await exportProductsToCsv({
                products: selectedProductsData,
                search: searchTerm,
                sort: sort.field,
                order: sort.order,
            });
            setToast({ 
                open: true, 
                message: `${selectedProducts.length} ürün başarıyla dışa aktarıldı`, 
                type: 'success' 
            });
        } catch (error) {
            setToast({ open: true, message: 'Toplu dışa aktarma başarısız', type: 'error' });
        } finally {
            setBulkActionLoading(false);
        }
    }, [selectedProducts, products, searchTerm, sort]);

    const handleExport = async () => {
        setLoadingExport(true);
        try {
            await exportProductsToCsv({
                search: searchTerm,
                category: filters.category,
                brand: filters.brand,
                lowStock: filters.lowStock,
                sort: sort.field,
                order: sort.order,
            });
            setToast({ open: true, message: 'Veriler başarıyla dışa aktarıldı', type: 'success' });
        } catch (error) {
            setToast({ open: true, message: 'Veriler dışa aktarılamadı.', type: 'error' });
        } finally {
            setLoadingExport(false);
        }
    };

    const handleExportLowStock = async () => {
        setToast({ open: true, message: 'Kritik stok verileri hazırlanıyor...', type: 'info' });
        const result = await exportLowStockToCsv(sort);

        if (result.success) {
            setToast({ open: true, message: 'Kritik stok verileri başarıyla dışa aktarıldı', type: 'success' });
        } else {
            setToast({ open: true, message: 'Kritik stok verileri dışa aktarılamadı.', type: 'error' });
        }
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setToast({ open: true, message: 'Stok sayım verileri işleniyor...', type: 'info' });
                
                const result = await importStockCountFromCsv(file);
                
                if (result.success && result.summary) {
                    const { successful, failed, updated, created } = result.summary;
                    setToast({
                        open: true,
                        message: `Stok sayımı tamamlandı! ${successful} başarılı, ${failed} hatalı. ${updated} güncellendi, ${created} oluşturuldu.`,
                        type: successful > 0 ? 'success' : 'warning'
                    });
                    fetchData(); // Verileri yenile
                } else {
                    setToast({
                        open: true,
                        message: `Import hatası: ${result.error}`,
                        type: 'error'
                    });
                }
            } else {
                setToast({ open: true, message: 'Lütfen CSV dosyası seçiniz', type: 'error' });
            }
        }
        // Input'u temizle
        event.target.value = '';
    };

    // Memoized calculations for better performance
    const lowStockCount = useMemo(() => 
        products.filter(p => p.trackStock && p.quantity <= p.criticalStockLevel).length, 
        [products]
    );
    
    const totalValue = useMemo(() => 
        products.reduce((sum, p) => sum + (p.quantity * p.salePrice), 0), 
        [products]
    );

    const filteredCategories = useMemo(() => 
        categories.filter(cat => 
            products.some(p => p.category === cat._id)
        ), 
        [categories, products]
    );

    const filteredBrands = useMemo(() => 
        brands.filter(brand => 
            products.some(p => p.brand === brand._id)
        ), 
        [brands, products]
    );

    if (loading && products.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AppBox>
            <AppTitle variant="h4" gutterBottom>
                <Inventory sx={{ mr: 2, verticalAlign: 'middle' }} />
                Ürün Yönetimi
            </AppTitle>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <StatCard 
                    title="Toplam Ürün" 
                    value={totalProducts} 
                    icon={<Store />} 
                    color={theme.palette.primary.main} 
                />
                <StatCard 
                    title="Kritik Stok" 
                    value={lowStockCount} 
                    icon={<Warning />} 
                    color={theme.palette.warning.main} 
                />
                <StatCard 
                    title="Toplam Değer" 
                    value={`₺${totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} 
                    icon={<Timeline />} 
                    color={theme.palette.success.main} 
                />
            </Box>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Ürünler" />
                <Tab label={selectedProductForLog ? `${selectedProductForLog.name} - Hareketleri` : "Ürün Hareketleri"} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                {/* Filters and Actions */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: isMobile ? 'stretch' : 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                        <Box sx={{ position: 'relative', minWidth: isMobile ? '100%' : '300px' }}>
                            <TextField
                                placeholder="OEM, üretici kodu veya ürün ara..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAdvancedSearch(searchTerm);
                                        setShowSuggestions(false);
                                    }
                                }}
                                onPaste={(e) => {
                                    // Ctrl+V ile yapıştırınca arama yap
                                    const pastedText = e.clipboardData.getData('text');
                                    if (pastedText && pastedText.trim().length > 0) {
                                        setTimeout(() => {
                                            handleAdvancedSearch(pastedText.trim());
                                        }, 100); // Kısa bir gecikme ile paste tamamlanmasını bekle
                                    }
                                }}
                                onBlur={() => {
                                    // Küçük bir gecikme ile önerileri gizle
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                                sx={{ width: '100%' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {searchLoading ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        handleAdvancedSearch(searchTerm);
                                                        setShowSuggestions(false);
                                                    }}
                                                    disabled={!searchTerm || searchTerm.trim().length === 0}
                                                >
                                                    <Search fontSize="small" />
                                                </IconButton>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {/* Arama Önerileri */}
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <Paper
                                    sx={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1000,
                                        maxHeight: 200,
                                        overflow: 'auto',
                                        mt: 1
                                    }}
                                >
                                    {searchSuggestions.map((suggestion, index) => (
                                        <Box
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            sx={{
                                                p: 1.5,
                                                cursor: 'pointer',
                                                borderBottom: index < searchSuggestions.length - 1 ? 1 : 0,
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <Typography variant="body2" color="text.primary">
                                                {suggestion.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Paper>
                            )}
                        </Box>
                        <FormControl sx={{ minWidth: 120 }} size="small">
                            <InputLabel>Kategori</InputLabel>
                            <Select
                                value={filters.category}
                                label="Kategori"
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                {categories.map(category => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 120 }} size="small">
                            <InputLabel>Marka</InputLabel>
                            <Select
                                value={filters.brand}
                                label="Marka"
                                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                {brands.map(brand => (
                                    <MenuItem key={brand._id} value={brand._id}>
                                        {brand.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.lowStock}
                                    onChange={(e) => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                                />
                            }
                            label="Kritik stok"
                        />
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            sx={{ fontSize: isMobile ? 12 : 14 }}
                        >
                            {showAdvancedFilters ? 'Filtreleri Gizle' : 'Gelişmiş Filtreler'}
                        </Button>
                    </Box>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            bgcolor: theme.palette.grey[50], 
                            borderRadius: 2,
                            display: 'flex',
                            gap: 2,
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}>
                            <TextField
                                label="Min Stok"
                                type="number"
                                size="small"
                                value={filters.minStock || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, minStock: e.target.value }))}
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Max Stok"
                                type="number"
                                size="small"
                                value={filters.maxStock || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxStock: e.target.value }))}
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Min Fiyat"
                                type="number"
                                size="small"
                                value={filters.minPrice || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                sx={{ width: 120 }}
                            />
                            <TextField
                                label="Max Fiyat"
                                type="number"
                                size="small"
                                value={filters.maxPrice || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                sx={{ width: 120 }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.trackStock}
                                        onChange={(e) => setFilters(prev => ({ ...prev, trackStock: e.target.checked }))}
                                    />
                                }
                                label="Stok Takibi"
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setFilters({ lowStock: false, category: '', brand: '', minStock: '', maxStock: '', minPrice: '', maxPrice: '', trackStock: false })}
                                sx={{ fontSize: 12 }}
                            >
                                Filtreleri Temizle
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, flexDirection: isMobile ? 'column' : 'row' }}>
                        <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            onClick={() => handleOpen()} 
                            sx={{ fontSize: isMobile ? 13 : 16, px: isMobile ? 1.5 : 3, py: isMobile ? 0.5 : 1.5 }}
                        >
                            Yeni Ürün
                        </Button>
                        <Button 
                            variant="outlined" 
                            startIcon={<Download />} 
                            onClick={handleExport} 
                            disabled={loadingExport}
                            sx={{ fontSize: isMobile ? 13 : 16, px: isMobile ? 1.5 : 3, py: isMobile ? 0.5 : 1.5 }}
                        >
                            {loadingExport ? 'Dışa Aktarılıyor...' : 'Dışa Aktar'}
                        </Button>
                        <input
                            accept=".csv"
                            style={{ display: 'none' }}
                            id="import-csv-file"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="import-csv-file">
                            <Button
                                variant="outlined"
                                startIcon={<Upload />}
                                component="span"
                                color="success"
                                sx={{ fontSize: isMobile ? 13 : 16, px: isMobile ? 1.5 : 3, py: isMobile ? 0.5 : 1.5 }}
                            >
                                Stok Sayım İmport
                            </Button>
                        </label>
                    </Box>
                </Box>

                {/* OEM Grupları */}
                {showOemGroups && searchResults && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Inventory /> OEM Grupları ({searchResults.groupedResults.length} grup)
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                            {searchResults.groupedResults.map((group, index) => (
                                <Paper key={index} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                        OEM: {group.oem}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {group.productCount} ürün • {group.manufacturers.join(', ')}
                                    </Typography>
                                    {group.priceRange.min !== group.priceRange.max && (
                                        <Typography variant="body2" color="text.secondary">
                                            Fiyat: ₺{group.priceRange.min.toLocaleString('tr-TR')} - ₺{group.priceRange.max.toLocaleString('tr-TR')}
                                        </Typography>
                                    )}
                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {group.manufacturers.map((manufacturer, idx) => (
                                            <Chip key={idx} label={manufacturer} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => setShowOemGroups(false)}
                                size="small"
                            >
                                Grupları Gizle
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Bulk Operations */}
                {selectedProducts.length > 0 && (
                    <Box sx={{ 
                        mb: 2, 
                        p: 2, 
                        bgcolor: theme.palette.primary.light, 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                            {selectedProducts.length} ürün seçildi
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={handleBulkDelete}
                            disabled={bulkActionLoading}
                            startIcon={<Delete />}
                        >
                            {bulkActionLoading ? 'Siliniyor...' : 'Seçilenleri Sil'}
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={handleBulkExport}
                            disabled={bulkActionLoading}
                            startIcon={<Download />}
                        >
                            {bulkActionLoading ? 'Dışa Aktarılıyor...' : 'Seçilenleri Dışa Aktar'}
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setSelectedProducts([])}
                            sx={{ color: 'white', borderColor: 'white' }}
                        >
                            Seçimi Temizle
                        </Button>
                    </Box>
                )}

                {/* Products Table */}
                <TableContainer component={Paper} sx={{ borderRadius: isMobile ? 1 : 2, overflowX: 'auto' }}>
                    <Table sx={{ minWidth: isMobile ? 400 : 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[50] }}>
                                    <Checkbox
                                        checked={selectedProducts.length === products.length && products.length > 0}
                                        indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        size="small"
                                    />
                                </TableCell>
                                {headCells.slice(1).map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        sortDirection={sort.field === headCell.id ? sort.order : false}
                                        sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[50] }}
                                    >
                                        {headCell.id !== 'actions' ? (
                                            <TableSortLabel
                                                active={sort.field === headCell.id}
                                                direction={sort.field === headCell.id ? sort.order : 'asc'}
                                                onClick={() => handleSortChange(headCell.id)}
                                            >
                                                {headCell.label}
                                            </TableSortLabel>
                                        ) : (
                                            headCell.label
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product._id} hover>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {product.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {product.manufacturerCode && `Üretici: ${product.manufacturerCode}`}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {product.oem || 'N/A'}
                                            </Typography>
                                            {searchResults && searchResults.isOemGroupSearch && (
                                                <Chip size="small" label="Grup" color="primary" sx={{ mt: 0.5 }} />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={`${product.quantity} ${product.unit}`}
                                                color={getStockStatusColor(product.quantity, product.criticalStockLevel)}
                                                size="small"
                                            />
                                            {product.trackStock && product.quantity <= product.criticalStockLevel && (
                                                <Tooltip title="Kritik stok seviyesinde">
                                                    <Warning color="warning" fontSize="small" />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>₺{product.salePrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Düzenle">
                                                <IconButton size="small" onClick={() => handleOpen(product)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton size="small" onClick={() => handleDelete(product._id)} color="error">
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Hareketleri Görüntüle">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => {
                                                        setSelectedProductForLog(product);
                                                        setTabValue(1); // Switch to movements tab
                                                    }}
                                                    color="info"
                                                >
                                                    <Info fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

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
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <ProductLogPanel productId={selectedProductForLog?._id} />
            </TabPanel>

            {/* Product Form Dialog */}
            <ProductFormDialog
                open={dialogOpen}
                onClose={handleClose}
                onSave={handleSave}
                product={selectedProduct}
                categories={categories}
                brands={brands}
                onCreateCategory={createCategory}
                onCreateBrand={createBrand}
                loading={dialogLoading}
            />

            {/* Toast Notification */}
            <Toast
                open={toast.open}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, open: false })}
            />
        </AppBox>
    );
};

export default ProductsPage;

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem,
    Chip, FormControlLabel, Switch, Box
} from '@mui/material';

const ProductFormDialog = ({ 
    open, 
    onClose, 
    onSave, 
    product, 
    categories, 
    brands, 
    onCreateCategory, 
    onCreateBrand 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        quantity: '',
        purchasePrice: '',
        salePrice: '',
        criticalStockLevel: '',
        unit: 'Adet',
        category: '',
        brand: '',
        shelfLocation: '',
        trackStock: true,
        tags: []
    });

    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                description: product.description || '',
                quantity: product.quantity || '',
                purchasePrice: product.purchasePrice || '',
                salePrice: product.salePrice || '',
                criticalStockLevel: product.criticalStockLevel || '',
                unit: product.unit || 'Adet',
                category: product.category || '',
                brand: product.brand || '',
                shelfLocation: product.shelfLocation || '',
                trackStock: product.trackStock !== false,
                tags: product.tags || []
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                barcode: '',
                description: '',
                quantity: '',
                purchasePrice: '',
                salePrice: '',
                criticalStockLevel: '',
                unit: 'Adet',
                category: '',
                brand: '',
                shelfLocation: '',
                trackStock: true,
                tags: []
            });
        }
    }, [product, open]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let dropdownValue = value;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        console.log('Updated formData:', { [name]: type === 'checkbox' ? checked : value });
        console.log('handleChange triggered for:', { name, value });
        if (name === 'category') {
            console.log('Dropdown change detected:', { name, dropdownValue });
        }
        console.log('Updated formData state:', formData);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = () => {
        const data = {
            ...formData,
            quantity: parseFloat(formData.quantity) || 0,
            purchasePrice: parseFloat(formData.purchasePrice) || 0,
            salePrice: parseFloat(formData.salePrice) || 0,
            criticalStockLevel: parseInt(formData.criticalStockLevel) || 0,
            category: formData.category || null,
            brand: formData.brand || null,
        };
        console.log('Submitting product data:', data);
        onSave(data);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.target.name === 'newTag') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{product ? 'Ürün Düzenle' : 'Yeni Ürün'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="name"
                            label="Ürün Adı"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="sku"
                            label="SKU"
                            value={formData.sku}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="barcode"
                            label="Barkod"
                            value={formData.barcode}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="quantity"
                            label="Stok Miktarı"
                            type="number"
                            value={formData.quantity}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="purchasePrice"
                            label="Alış Fiyatı"
                            type="number"
                            value={formData.purchasePrice}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="salePrice"
                            label="Satış Fiyatı"
                            type="number"
                            value={formData.salePrice}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Kategori</InputLabel>
                            <Select
                                name="category"
                                value={formData.category || ''}
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Seçiniz</em>
                                </MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Marka</InputLabel>
                            <Select
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                label="Marka"
                            >
                                {brands.map(brand => (
                                    <MenuItem key={brand._id} value={brand._id}>
                                        {brand.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="unit"
                            label="Birim"
                            value={formData.unit}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="criticalStockLevel"
                            label="Kritik Stok Seviyesi"
                            type="number"
                            value={formData.criticalStockLevel}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="shelfLocation"
                            label="Raf Konumu"
                            value={formData.shelfLocation}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.trackStock}
                                    onChange={handleChange}
                                    name="trackStock"
                                />
                            }
                            label="Stok Takibi"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Açıklama"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                name="newTag"
                                label="Etiket Ekle"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={handleKeyPress}
                                size="small"
                            />
                            <Button onClick={handleAddTag} variant="outlined" size="small">
                                Ekle
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {formData.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleRemoveTag(tag)}
                                    size="small"
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {product ? 'Güncelle' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductFormDialog;

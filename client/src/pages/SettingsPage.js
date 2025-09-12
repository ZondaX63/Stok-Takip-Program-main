import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Paper, CircularProgress, Tabs, Tab, TextField, Button,
    Grid, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Stack, Chip, IconButton, Box
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';
import Toast from '../components/Toast';
import { AppBox, AppTitle, AppButtonGroup, AppButton, AppSubtitle } from '../components/Styled';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const [company, setCompany] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
    const [unitInput, setUnitInput] = useState('');
    const [docTypeInput, setDocTypeInput] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/settings');
            setSettings(data.settings);
            setCompany(data.company);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            setToast({ open: true, message: 'Ayarlar yüklenemedi.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleTabChange = (event, newValue) => setTabIndex(newValue);
    const handleCompanyChange = (e) => setCompany({ ...company, [e.target.name]: e.target.value });
    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUnit = () => {
        if (!unitInput) {
            setToast({ open: true, message: 'Birim adı boş olamaz.', type: 'error' });
            return;
        }
        if (settings.units.includes(unitInput)) {
            setToast({ open: true, message: 'Bu birim zaten mevcut.', type: 'error' });
            return;
        }
        setSettings({ ...settings, units: [...settings.units, unitInput] });
        setUnitInput('');
    };

    const handleDeleteUnit = (unitToDelete) => {
        if (window.confirm(`Are you sure you want to delete the unit "${unitToDelete}"?`)) {
            setSettings({ ...settings, units: settings.units.filter(unit => unit !== unitToDelete) });
        }
    };

    const handleAddDocType = () => {
        if (docTypeInput && !settings.documentTypes.includes(docTypeInput)) {
            setSettings({ ...settings, documentTypes: [...settings.documentTypes, docTypeInput] });
            setDocTypeInput('');
        }
    };

    const handleDeleteDocType = (docTypeToDelete) => {
        setSettings({ ...settings, documentTypes: settings.documentTypes.filter(doc => doc !== docTypeToDelete) });
    };

    const handleSaveSettings = async () => {
        if (!settings || !company) {
            setToast({ open: true, message: 'Lütfen tüm alanları doldurun.', type: 'warning' });
            return;
        }

        if (!window.confirm('Ayarları kaydetmek istediğinize emin misiniz?')) {
            return;
        }

        setSaving(true);
        try {
            await api.put('/settings', { settings, company });
            setToast({ open: true, message: 'Ayarlar kaydedildi.', type: 'success' });
        } catch (error) {
            setToast({ open: true, message: 'Ayarlar kaydedilemedi.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (!settings || !company) return <Typography>Ayarlar yüklenemedi.</Typography>;

    return (
        <AppBox elevation={10}>
            <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
            <AppButtonGroup sx={{ justifyContent: { xs: 'flex-start', sm: 'space-between' }, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
                <AppTitle variant="h4" sx={{ flex: 1, mb: { xs: 1, sm: 0 } }}>Ayarlar</AppTitle>
                <AppButton
                    onClick={handleSaveSettings}
                    disabled={saving}
                    aria-label="Save changes"
                    sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, minWidth: 160, height: 48, fontSize: '1.1rem' }}
                >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </AppButton>
            </AppButtonGroup>
            <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tab label="Genel Ayarlar" />
                <Tab label="Görünüm" />
                <Tab label="Birimler" />
                <Tab label="Belge Türleri" />
            </Tabs>
            <Box p={3}>
                {tabIndex === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}><TextField label="Şirket Adı" name="name" value={company.name} onChange={handleCompanyChange} fullWidth /></Grid>
                        <Grid item xs={12} md={6}><TextField label="Şirket E-postası" name="email" value={company.email} onChange={handleCompanyChange} fullWidth /></Grid>
                        <Grid item xs={12} md={6}><TextField label="Telefon" name="phone" value={company.phone} onChange={handleCompanyChange} fullWidth /></Grid>
                        <Grid item xs={12} md={6}><TextField label="Vergi Numarası" name="taxNumber" value={company.taxNumber} onChange={handleCompanyChange} fullWidth /></Grid>
                        <Grid item xs={12}><TextField label="Adres" name="address" value={company.address} onChange={handleCompanyChange} fullWidth multiline rows={3} /></Grid>
                    </Grid>
                )}
                {tabIndex === 1 && (
                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <AppSubtitle sx={{ mb: 2 }}>Uygulama Teması</AppSubtitle>
                        <RadioGroup row name="theme" value={settings.theme} onChange={handleSettingsChange}>
                            <FormControlLabel value="light" control={<Radio />} label="Açık Mod" />
                            <FormControlLabel value="dark" control={<Radio />} label="Koyu Mod" />
                        </RadioGroup>
                    </FormControl>
                )}
                {tabIndex === 2 && (
                    <Box>
                        <AppSubtitle sx={{ mb: 2 }}>Ölçü Birimleri Yönetimi</AppSubtitle>
                        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
                            <TextField
                                label="Yeni Birim Ekle"
                                value={unitInput}
                                onChange={(e) => setUnitInput(e.target.value)}
                                size="small"
                            />
                            <Button variant="outlined" onClick={handleAddUnit} startIcon={<AddCircleOutlineIcon />}>Ekle</Button>
                        </Stack>
                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {settings.units.map(unit => (
                                <Chip
                                    key={unit}
                                    label={unit}
                                    onDelete={() => handleDeleteUnit(unit)}
                                />
                            ))}
                        </Paper>
                    </Box>
                )}
                {tabIndex === 3 && (
                    <Box>
                        <AppSubtitle sx={{ mb: 2 }}>Belge Türleri Yönetimi</AppSubtitle>
                        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
                            <TextField
                                label="Yeni Belge Türü Ekle"
                                value={docTypeInput}
                                onChange={(e) => setDocTypeInput(e.target.value)}
                                size="small"
                            />
                            <Button variant="outlined" onClick={handleAddDocType} startIcon={<AddCircleOutlineIcon />}>Ekle</Button>
                        </Stack>
                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {settings.documentTypes.map(doc => (
                                <Chip
                                    key={doc}
                                    label={doc}
                                    onDelete={() => handleDeleteDocType(doc)}
                                />
                            ))}
                        </Paper>
                    </Box>
                )}
            </Box>
        </AppBox>
    );
};

export default SettingsPage;

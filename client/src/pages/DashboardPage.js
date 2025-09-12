import React, { useEffect, useState } from 'react';
import {
    Grid, Typography, Paper, Box, CircularProgress, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, Chip, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
    AccountBalanceWallet, WarningAmber, TrendingUp, TrendingDown, Schedule
} from '@mui/icons-material';
import api from '../api';
import { format, parseISO } from 'date-fns';
import { AppBox, AppTitle, AppSubtitle } from '../components/Styled';
import DashboardCard from '../components/DashboardCard';

const DashboardPage = () => {
    const [accounts, setAccounts] = useState(null);
    const [flow, setFlow] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState(null);
    const [customers, setCustomers] = useState(null);
    const [dueInvoices, setDueInvoices] = useState(null);
    const [summary, setSummary] = useState(null);
    const [cashReport, setCashReport] = useState(null);

    const [currentTime, setCurrentTime] = useState(new Date());

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            api.get('/accounts'),
            api.get('/transactions/flow'),
            api.get('/products?limit=0'),
            api.get('/customers?limit=0'),
            api.get('/invoices/due-soon'),
            api.get('/dashboard/summary'),
            api.get('/reports/cash')
        ]).then(results => {
            const [accRes, flowRes, prodRes, custRes, dueInvRes, summaryRes, cashRes] = results;
            console.log('Dashboard API Results:', {
                accounts: accRes.status,
                flow: flowRes.status,
                products: prodRes.status,
                customers: custRes.status,
                dueInvoices: dueInvRes.status,
                summary: summaryRes.status,
                cashReport: cashRes.status
            });
            if (accRes.status === 'fulfilled') setAccounts(accRes.value.data); else console.error('Accounts API error:', accRes.reason);
            if (flowRes.status === 'fulfilled') setRecentTransactions(flowRes.value.data); else console.error('Transactions API error:', flowRes.reason);
            if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data?.products || prodRes.value.data || []); else console.error('Products API error:', prodRes.reason);
            if (custRes.status === 'fulfilled') setCustomers(custRes.value.data); else console.error('Customers API error:', custRes.reason);
            if (dueInvRes.status === 'fulfilled') setDueInvoices(dueInvRes.value.data); else console.error('Due Invoices API error:', dueInvRes.reason);
            if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data); else console.error('Summary API error:', summaryRes.reason);
            if (cashRes.status === 'fulfilled') setCashReport(cashRes.value.data); else console.error('Cash Report API error:', cashRes.reason);
            
            // Debug: Check which data is null/undefined
            console.log('Dashboard Data Check:', {
                accounts: !!accRes.value?.data,
                recentTransactions: !!flowRes.value?.data,
                products: !!prodRes.value?.data,
                customers: !!custRes.value?.data,
                dueInvoices: !!dueInvRes.value?.data,
                summary: !!summaryRes.value?.data,
                cashReport: !!cashRes.value?.data
            });
        }).catch(err => {
            console.error('Error loading dashboard data:', err);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    // Saat güncelleme effect'i
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Her saniye güncelle

        return () => clearInterval(timer);
    }, []);

    const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
    // Gelir/Gider: summary.monthly verisinden al (fallback: transaction flow toplamı)
    const totalIncome = summary?.monthly?.current?.income ?? (recentTransactions?.reduce((sum, f) => sum + (f.income || 0), 0) || 0);
    const totalExpense = summary?.monthly?.current?.expense ?? (recentTransactions?.reduce((sum, f) => sum + (f.expense || 0), 0) || 0);

    const lowStockCount = Array.isArray(summary?.criticalStocks)
        ? summary.criticalStocks.length
        : (Array.isArray(products) ? products.filter(p => p.trackStock && typeof p.quantity === 'number' && typeof p.criticalStockLevel === 'number' && p.quantity <= p.criticalStockLevel).length : 0);

    const now = currentTime;
    const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (!accounts || !recentTransactions || !products || !customers || !dueInvoices || !summary || !cashReport) {
        return <Typography>Dashboard verileri yüklenemedi.</Typography>;
    }

    // Yüzdesel değişim hesaplama
    function percentChange(current, prev) {
        if (prev === 0) return current === 0 ? 0 : 100;
        return ((current - prev) / Math.abs(prev)) * 100;
    }
    const incomeChange = percentChange(summary?.monthly?.current?.income || 0, summary?.monthly?.prev?.income || 0);
    const expenseChange = percentChange(summary?.monthly?.current?.expense || 0, summary?.monthly?.prev?.expense || 0);
    return (
        <AppBox>
            <Box>
                <AppTitle variant="h4">Panel</AppTitle>
                <AppSubtitle>{dateStr} - {timeStr}</AppSubtitle>
                {/* Dashboard üst kartlar */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: isMobile ? 1.5 : 3,
                    mb: isMobile ? 2 : 4
                }}>
                    <DashboardCard
                        title="Toplam Bakiye"
                        value={`₺${totalBalance.toLocaleString('tr-TR')}`}
                        icon={<AccountBalanceWallet />}
                        color="#fff"
                        borderColor="#1976d2"
                        tooltip="Kasa + Banka toplamı"
                        negative={totalBalance < 0}
                        onClick={() => window.location.href = '/hesaplar'}
                        action={<Tooltip title="Detaylı hesaplara git"><IconButton size="small"><Schedule /></IconButton></Tooltip>}
                    />
                    <DashboardCard
                        title="Toplam Gelir"
                        value={`₺${totalIncome.toLocaleString('tr-TR')}`}
                        icon={<TrendingUp />}
                        color="#fff"
                        borderColor="#43a047"
                        tooltip="Bu ayki onaylı faturalardan elde edilen gelir"
                    />
                    <DashboardCard
                        title="Toplam Gider"
                        value={`₺${totalExpense.toLocaleString('tr-TR')}`}
                        icon={<TrendingDown />}
                        color="#fff"
                        borderColor="#e53935"
                        tooltip="Bu ayki onaylı faturalardan yapılan giderler"
                        negative={totalExpense > 0}
                    />
                    <DashboardCard
                        title="Kritik Stoktaki Ürün"
                        value={lowStockCount}
                        icon={<WarningAmber />}
                        color="#fffde7"
                        borderColor="#ffb300"
                        tooltip="Stok seviyesi kritik olan ürün sayısı"
                    />
                </Box>
                {/* Satışlar ve kritik stoklar */}
                <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: isMobile ? 1 : 2, mb: isMobile ? 2 : 4 }}>
                            <Typography variant="h6" sx={{ mb: isMobile ? 1 : 2, color: '#1976d2', fontWeight: 700, fontSize: isMobile ? 15 : 18 }}>Son 7 Günlük Satışlar</Typography>
                            <ResponsiveContainer width="100%" height={isMobile ? 160 : 250}>
                                <LineChart data={summary?.sales || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="_id" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: isMobile ? 1 : 2, mb: isMobile ? 2 : 4, height: isMobile ? 300 : 400, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: isMobile ? 1 : 2, color: '#1976d2', fontWeight: 700, fontSize: isMobile ? 15 : 18 }}>Kritik Stoklar</Typography>
                            <TableContainer sx={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
                                <Table size="small" sx={{ minWidth: isMobile ? 320 : 400 }}>
                                    <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
                                        <TableRow>
                                            <TableCell>Ürün</TableCell>
                                            <TableCell align="right">Stok</TableCell>
                                            <TableCell align="right">Kritik</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {summary.criticalStocks.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} align="center">Kritik stok yok</TableCell></TableRow>
                                        ) : summary.criticalStocks.slice(0, 10).map(cs => (
                                            <TableRow key={cs._id}>
                                                <TableCell sx={{ maxWidth: isMobile ? 120 : 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{cs.name}</TableCell>
                                                <TableCell align="right">{cs.quantity}</TableCell>
                                                <TableCell align="right">{cs.criticalStockLevel}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {summary.criticalStocks.length > 10 && (
                                <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
                                    Ve {summary.criticalStocks.length - 10} ürün daha...
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
                {/* ...diğer dashboard içerikleri... */}
            </Box>
        </AppBox>
    );
};

export default DashboardPage;

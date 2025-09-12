import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Breadcrumbs, Link } from '@mui/material';
import { ArrowUpward, ArrowDownward, Home } from '@mui/icons-material';
import api from '../api';
import { AppBox, AppTitle } from '../components/Styled';

export default function ProductMovementsPage() {
    const { productId } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMovements = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/movements/product/${productId}`);
                setData(res.data);
            } catch (err) {
                setError('Veriler yüklenemedi.');
            } finally {
                setLoading(false);
            }
        };
        fetchMovements();
    }, [productId]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}><CircularProgress /></div>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!data) return null;

    const { product, movements } = data;

    return (
        <AppBox elevation={10}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/panel" sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
                    <Home sx={{ mr: 0.5 }} /> Anasayfa
                </Link>
                <Link component={RouterLink} to="/panel/products" color="inherit">
                    Ürünler
                </Link>
                <Typography color="text.primary">{product.name} Stok Hareketleri</Typography>
            </Breadcrumbs>

            <AppTitle variant="h4">{product.name}</AppTitle>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Mevcut Stok: {product.quantity} {product.unit}
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tarih</TableCell>
                            <TableCell>Tip</TableCell>
                            <TableCell>Miktar</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>İlişkili Belge</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {movements.map((move) => (
                            <TableRow key={move._id} hover>
                                <TableCell>{new Date(move.date).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip 
                                        icon={move.type === 'in' ? <ArrowUpward /> : <ArrowDownward />}
                                        label={move.type === 'in' ? 'Stok Girişi' : 'Stok Çıkışı'} 
                                        color={move.type === 'in' ? 'success' : 'error'}
                                        variant="outlined"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    {move.type === 'in' ? '+' : '-'}{move.quantity}
                                </TableCell>
                                <TableCell>{move.description}</TableCell>
                                <TableCell>
                                    {move.relatedDocument ? (
                                        <Link component={RouterLink} to={`/panel/invoices/${move.relatedDocument._id}`}>
                                            {move.relatedDocument.invoiceNumber || 'Faturayı Görüntüle'}
                                        </Link>
                                    ) : 'Yok'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </AppBox>
    );
}
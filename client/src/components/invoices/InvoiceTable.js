import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, TableSortLabel, Typography, Chip, Box, 
    Tooltip, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import {
    Edit, Delete, Visibility, Payment, CheckCircle, Undo, ContentCopy
} from '@mui/icons-material';
import { getStatusLabel, getStatusColor } from '../../utils/invoiceUtils';

const headCells = [
    { id: 'invoiceNumber', label: 'Fatura No', disableSorting: false },
    { id: 'partner', label: 'Müşteri/Tedarikçi', disableSorting: true },
    { id: 'type', label: 'Tip', disableSorting: false },
    { id: 'date', label: 'Tarih', disableSorting: false },
    { id: 'totalAmount', label: 'Tutar', disableSorting: false },
    { id: 'status', label: 'Durum', disableSorting: false },
    { id: 'actions', label: 'Aksiyonlar', disableSorting: true },
];

const InvoiceTable = ({
    invoices,
    sort,
    onSortChange,
    onEdit,
    onDelete,
    onViewPdf,
    onDuplicate,
    onStatusChange,
    getStatusTransition
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <TableContainer component={Paper} sx={{ borderRadius: isMobile ? 1 : 2, overflowX: 'auto' }}>
            <Table sx={{ minWidth: isMobile ? 600 : 950 }}>
                <TableHead>
                    <TableRow>
                        {headCells.map((headCell) => (
                            <TableCell
                                key={headCell.id}
                                sortDirection={sort.field === headCell.id ? sort.order : false}
                                sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[50] }}
                            >
                                {!headCell.disableSorting ? (
                                    <TableSortLabel
                                        active={sort.field === headCell.id}
                                        direction={sort.field === headCell.id ? sort.order : 'asc'}
                                        onClick={() => onSortChange(headCell.id)}
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
                    {invoices.map((invoice) => {
                        const partner = invoice.customer || invoice.supplier;
                        const nextTransition = getStatusTransition(invoice.status, 'next');
                        const prevTransition = getStatusTransition(invoice.status, 'prev');

                        return (
                            <TableRow key={invoice._id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {invoice.invoiceNumber}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {partner?.companyName || partner?.name || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={invoice.type === 'sale' ? 'Satış' : 'Alış'}
                                        color={invoice.type === 'sale' ? 'success' : 'primary'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(invoice.date).toLocaleDateString('tr-TR')}
                                </TableCell>
                                <TableCell>
                                    ₺{invoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusLabel(invoice.status)}
                                        color={getStatusColor(invoice.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Tooltip title="Düzenle">
                                            <IconButton size="small" onClick={() => onEdit(invoice)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="PDF Görüntüle">
                                            <IconButton size="small" onClick={() => onViewPdf(invoice)} color="info">
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Kopyala">
                                            <IconButton size="small" onClick={() => onDuplicate(invoice)} color="secondary">
                                                <ContentCopy fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {nextTransition && (
                                            <Tooltip title={nextTransition.label}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => onStatusChange(invoice._id, nextTransition.status)}
                                                    color={nextTransition.color}
                                                >
                                                    {nextTransition.icon === 'CheckCircle' && <CheckCircle fontSize="small" />}
                                                    {nextTransition.icon === 'Payment' && <Payment fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {prevTransition && (
                                            <Tooltip title={prevTransition.label}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => onStatusChange(invoice._id, prevTransition.status)}
                                                    color={prevTransition.color}
                                                >
                                                    <Undo fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Sil">
                                            <IconButton size="small" onClick={() => onDelete(invoice._id)} color="error">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InvoiceTable;
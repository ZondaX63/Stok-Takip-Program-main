import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, IconButton, Chip
} from '@mui/material';
import { Edit, Delete, Info, Payment } from '@mui/icons-material';

const SupplierTable = ({ 
    suppliers, 
    onEdit, 
    onDelete, 
    onViewDetail, 
    onOpenTransfer,
    search 
}) => {
    // Array kontrolü ekle
    const suppliersArray = Array.isArray(suppliers) ? suppliers : [];
    
    const filteredSuppliers = suppliersArray.filter(supplier =>
        supplier.name?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.phone?.includes(search) ||
        supplier.contactPerson?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Tedarikçi Adı</TableCell>
                        <TableCell>Yetkili Kişi</TableCell>
                        <TableCell>E-posta</TableCell>
                        <TableCell>Telefon</TableCell>
                        <TableCell>Borç Durumu</TableCell>
                        <TableCell>İşlemler</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier._id}>
                            <TableCell>{supplier.name}</TableCell>
                            <TableCell>{supplier.contactPerson || '-'}</TableCell>
                            <TableCell>{supplier.email}</TableCell>
                            <TableCell>{supplier.phone || '-'}</TableCell>
                            <TableCell>
                                {(() => {
                                    const debt = supplier.debt || 0;
                                    const credit = supplier.credit || 0;
                                    const balance = debt - credit;
                                    
                                    if (balance > 0) {
                                        return <Chip 
                                            label={`Borç: ₺${balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                                            color="warning"
                                            size="small"
                                        />;
                                    } else if (balance < 0) {
                                        return <Chip 
                                            label={`Ödeme: ₺${Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                                            color="error"
                                            size="small"
                                        />;
                                    } else {
                                        return <Chip label="Bakiye: ₺0.00" color="default" size="small" />;
                                    }
                                })()}
                            </TableCell>
                            <TableCell>
                                <IconButton onClick={() => onEdit(supplier)} size="small">
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => onDelete(supplier._id)} size="small" color="error">
                                    <Delete />
                                </IconButton>
                                <IconButton onClick={() => onViewDetail(supplier._id)} size="small" color="info">
                                    <Info />
                                </IconButton>
                                <IconButton onClick={() => onOpenTransfer && onOpenTransfer(supplier)} size="small" color="primary">
                                    <Payment />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SupplierTable;

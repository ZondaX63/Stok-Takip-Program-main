import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, IconButton, Chip
} from '@mui/material';
import { Edit, Delete, Info, Payment } from '@mui/icons-material';

const CustomerTable = ({ 
    customers, 
    onEdit, 
    onDelete, 
    onViewDetail, 
    onOpenTransfer,
    search 
}) => {
    // Array kontrolü ekle
    const customersArray = Array.isArray(customers) ? customers : [];
    
    const filteredCustomers = customersArray.filter(customer =>
        customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone?.includes(search)
    );

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Ad</TableCell>
                        <TableCell>E-posta</TableCell>
                        <TableCell>Telefon</TableCell>
                        <TableCell>Adres</TableCell>
                        <TableCell>Borç Durumu</TableCell>
                        <TableCell>İşlemler</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredCustomers.map((customer) => (
                        <TableRow key={customer._id}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.address}</TableCell>
                            <TableCell>
                                {(() => {
                                    const debt = customer.debt || 0;
                                    const credit = customer.credit || 0;
                                    const balance = debt - credit;
                                    
                                    if (balance > 0) {
                                        return <Chip 
                                            label={`Borç: ₺${balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                                            color="error"
                                            size="small"
                                        />;
                                    } else if (balance < 0) {
                                        return <Chip 
                                            label={`Alacak: ₺${Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                                            color="success"
                                            size="small"
                                        />;
                                    } else {
                                        return <Chip label="Bakiye: ₺0.00" color="default" size="small" />;
                                    }
                                })()}
                            </TableCell>
                            <TableCell>
                                <IconButton onClick={() => onEdit(customer)} size="small">
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => onDelete(customer._id)} size="small" color="error">
                                    <Delete />
                                </IconButton>
                                <IconButton onClick={() => onViewDetail(customer._id)} size="small" color="info">
                                    <Info />
                                </IconButton>
                                <IconButton onClick={() => onOpenTransfer(customer)} size="small" color="primary">
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

export default CustomerTable;

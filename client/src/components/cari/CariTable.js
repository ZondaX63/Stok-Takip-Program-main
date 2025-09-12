import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Box,
  Pagination
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';

const CariTable = ({ 
  partners, 
  sort, 
  onSort, 
  onEdit, 
  onDetail,
  page,
  totalPages,
  onPageChange,
  loading 
}) => {
  // Array kontrolü ekle
  const partnersArray = Array.isArray(partners) ? partners : [];
  
  const getTypeColor = (type) => {
    return type === 'customer' ? 'primary' : 'warning';
  };

  const getTypeLabel = (type) => {
    return type === 'customer' ? 'Müşteri' : 'Tedarikçi';
  };

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <TableSortLabel
                  active={sort.field === 'name'}
                  direction={sort.field === 'name' ? sort.order : 'asc'}
                  onClick={() => onSort('name')}
                  sx={{ color: 'white !important' }}
                >
                  Ad
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tip</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <TableSortLabel
                  active={sort.field === 'email'}
                  direction={sort.field === 'email' ? sort.order : 'asc'}
                  onClick={() => onSort('email')}
                  sx={{ color: 'white !important' }}
                >
                  E-posta
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Telefon</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Borç</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Alacak</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {partnersArray.map((partner) => (
              <TableRow key={partner._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {partner.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(partner.type)}
                    color={getTypeColor(partner.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {partner.email || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {partner.phone || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    ₺{partner.debt?.toLocaleString('tr-TR') || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    ₺{partner.credit?.toLocaleString('tr-TR') || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(partner)}
                        sx={{ color: '#667eea' }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Detay Görüntüle">
                      <IconButton
                        size="small"
                        onClick={() => onDetail(partner)}
                        sx={{ color: '#11998e' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {totalPages > 1 && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => onPageChange(value)}
            color="primary"
          />
        </Box>
      )}
    </Paper>
  );
};

export default CariTable;

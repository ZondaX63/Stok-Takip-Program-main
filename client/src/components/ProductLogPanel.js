import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  List, ListItem, ListItemText, Typography, CircularProgress, 
  Box, Tabs, Tab, Chip, Divider, Paper
} from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ProductLogPanel({ productId }) {
  const [logs, setLogs] = useState([]);
  const [movements, setMovements] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!productId) return;
    
    setLoading(true);
    
    Promise.all([
      api.get('/logs', { params: { module: 'product', targetId: productId } }),
      api.get(`/movements/product/${productId}`)
    ])
    .then(([logsRes, movementsRes]) => {
      setLogs(logsRes.data);
      setMovements(movementsRes.data.movements || []);
      setProduct(movementsRes.data.product);
    })
    .catch(error => {
      console.error('Error fetching product data:', error);
    })
    .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Ürün hareketlerini görmek için listeden bir ürün seçin.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {product && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            SKU: {product.sku} | Mevcut Stok: {product.quantity} {product.unit}
          </Typography>
        </Paper>
      )}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label={`Stok Hareketleri (${movements.length})`} />
        <Tab label={`İşlem Logları (${logs.length})`} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {!movements.length ? (
          <Typography variant="body2" color="text.secondary">
            Stok hareketi kaydı yok.
          </Typography>
        ) : (
          <List dense>
            {movements.map(movement => (
              <ListItem key={movement._id} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {movement.type === 'in' ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" component="span">
                        {movement.type === 'in' ? 'Giriş' : 'Çıkış'}: {movement.quantity} {product?.unit}
                      </Typography>
                      <Chip
                        label={movement.type === 'in' ? `+${movement.quantity}` : `-${movement.quantity}`}
                        color={movement.type === 'in' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block" component="span">
                        {new Date(movement.date).toLocaleString('tr-TR')}
                      </Typography>
                      {movement.invoice?.invoiceNumber && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary" component="span">
                            Fatura: {movement.invoice.invoiceNumber}
                          </Typography>
                        </>
                      )}
                      {movement.notes && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary" component="span">
                            {movement.notes}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
                <Divider />
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {!logs.length ? (
          <Typography variant="body2" color="text.secondary">
            İşlem kaydı yok.
          </Typography>
        ) : (
          <List dense>
            {logs.map(log => (
              <ListItem key={log._id} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info color="info" fontSize="small" />
                      <Typography variant="body2" component="span">
                        {log.user?.name || 'Kullanıcı'} - {log.action}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block" component="span">
                        {new Date(log.date).toLocaleString('tr-TR')}
                      </Typography>
                      <br />
                      <Typography variant="body2" color="text.secondary" component="span">
                        {log.message}
                      </Typography>
                    </>
                  }
                />
                <Divider />
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>
    </Box>
  );
}
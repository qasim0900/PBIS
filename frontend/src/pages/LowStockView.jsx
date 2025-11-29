import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Fade,
  Alert,
} from '@mui/material';
import {
  TrendingDown,
  Warning,
  Error,
  CheckCircle,
  Print,
  Download,
  Inventory,
} from '@mui/icons-material';
import Header from '../components/Header';
import countsAPI from '../services/countsAPI';
import { showNotification } from '../store/slices/uiSlice';

const LowStockView = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = useCallback(async () => {
    try {
      const response = await countsAPI.getLowStock();
      setItems(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
      dispatch(showNotification({ message: 'Failed to fetch low stock items', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  

  const getStatusInfo = (highlight) => {
    switch (highlight) {
      case 'low':
        return { color: 'error', label: 'Critical', icon: <Error fontSize="small" /> };
      case 'near_par':
        return { color: 'warning', label: 'Low', icon: <Warning fontSize="small" /> };
      default:
        return { color: 'success', label: 'OK', icon: <CheckCircle fontSize="small" /> };
    }
  };

  const criticalCount = items.filter(i => i.highlight === 'low').length;
  const lowCount = items.filter(i => i.highlight === 'near_par').length;

  return (
    <Box>
      <Header 
        title="Low Stock Alert" 
        subtitle="Items that need to be reordered"
        showRefresh
        onRefresh={fetchLowStock}
      >
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={() => window.print()}
          sx={{ mr: 1 }}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Export PDF
        </Button>
      </Header>

      {criticalCount > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>{criticalCount} items are critically low</strong> and need immediate attention!
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Error />
              <Typography variant="overline">Critical</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{criticalCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Warning />
              <Typography variant="overline">Low Stock</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{lowCount}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingDown color="primary" />
              <Typography variant="overline" color="text.secondary">Total Alerts</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} color="primary">{items.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              All items are well stocked!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No items require immediate reordering at this time.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Fade in={true}>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="center">On Hand</TableCell>
                    <TableCell align="center">Par Level</TableCell>
                    <TableCell align="center">Order Qty</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => {
                    const status = getStatusInfo(item.highlight);
                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                backgroundColor: `${status.color}.light`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Inventory sx={{ color: `${status.color}.main`, fontSize: 20 }} />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {item.catalog_item?.name || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.catalog_item?.category || 'General'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.sheet?.location_name || 'N/A'} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            color={item.on_hand_quantity < 5 ? 'error' : 'text.primary'}
                          >
                            {item.on_hand_quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1">
                            {item.override?.par_level || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="h6" 
                            fontWeight={700}
                            color="error.main"
                          >
                            {item.qty_to_order || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={status.icon}
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>
      )}
    </Box>
  );
};

export default LowStockView;

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
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Skeleton,
  Fade,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Tune,
  LocationOn,
  Inventory,
  Schedule,
} from '@mui/icons-material';
import Header from '../components/Header';
import overridesAPI from '../services/overridesAPI';
import locationsAPI from '../services/locationsAPI';
import catalogAPI from '../services/catalogAPI';
import { showNotification } from '../store/slices/uiSlice';

const FREQUENCIES = [
  { value: 'mon_wed', label: 'Mon/Wed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
];

const OverridesView = () => {
  const dispatch = useDispatch();
  const [overrides, setOverrides] = useState([]);
  const [locations, setLocations] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);
  const [deletingOverride, setDeletingOverride] = useState(null);
  const [formData, setFormData] = useState({
    catalog_item: '',
    par_level: 10,
    order_point: 5,
    count_frequency: 'weekly',
    storage_location: '',
    min_order_qty: 1,
    is_active: true,
  });

  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationsAPI.getAll();
      const locs = response.data.results || response.data || [];
      setLocations(locs);
      if (locs.length > 0) {
        setSelectedLocation(locs[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    }
  }, [dispatch]);

  const fetchCatalogItems = useCallback(async () => {
    try {
      const response = await catalogAPI.getAll();
      setCatalogItems(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch catalog items:', error);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    fetchCatalogItems();
  }, [fetchLocations, fetchCatalogItems]);

  useEffect(() => {
    if (selectedLocation) {
      fetchOverrides();
    }
  }, [selectedLocation]);

  

  

  const fetchOverrides = useCallback(async () => {
    setLoading(true);
    try {
      const response = await overridesAPI.getAll(selectedLocation);
      setOverrides(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch overrides:', error);
      dispatch(showNotification({ message: 'Failed to fetch overrides', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, location: selectedLocation };
      if (editingOverride) {
        await overridesAPI.update(editingOverride.id, data);
        dispatch(showNotification({ message: 'Override updated successfully', type: 'success' }));
      } else {
        await overridesAPI.create(data);
        dispatch(showNotification({ message: 'Override created successfully', type: 'success' }));
      }
      fetchOverrides();
      closeModal();
    } catch (error) {
      console.error('Failed to save override:', error);
      dispatch(showNotification({ message: 'Failed to save override', type: 'error' }));
    }
  };

  const handleEdit = (override) => {
    setEditingOverride(override);
    setFormData({
      catalog_item: override.catalog_item?.id || override.catalog_item,
      par_level: override.par_level,
      order_point: override.order_point,
      count_frequency: override.count_frequency,
      storage_location: override.storage_location || '',
      min_order_qty: override.min_order_qty || 1,
      is_active: override.is_active,
    });
    setModalOpen(true);
  };

  const handleDeleteClick = (override) => {
    setDeletingOverride(override);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await overridesAPI.delete(deletingOverride.id);
      dispatch(showNotification({ message: 'Override deleted successfully', type: 'success' }));
      fetchOverrides();
    } catch (error) {
      console.error('Failed to delete override:', error);
      dispatch(showNotification({ message: 'Failed to delete override', type: 'error' }));
    } finally {
      setDeleteDialogOpen(false);
      setDeletingOverride(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOverride(null);
    setFormData({
      catalog_item: '',
      par_level: 10,
      order_point: 5,
      count_frequency: 'weekly',
      storage_location: '',
      min_order_qty: 1,
      is_active: true,
    });
  };

  const getFrequencyLabel = (freq) => FREQUENCIES.find(f => f.value === freq)?.label || freq;

  return (
    <Box>
      <Header 
        title="Location Overrides" 
        subtitle="Customize inventory settings per location"
        showRefresh
        onRefresh={fetchOverrides}
      >
        <TextField
          select
          size="small"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          sx={{ minWidth: 200, mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        >
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Add Override
        </Button>
      </Header>

      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
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
                    <TableCell align="center">Par Level</TableCell>
                    <TableCell align="center">Order Point</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Storage</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overrides.map((override) => (
                    <TableRow key={override.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              backgroundColor: 'primary.light',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Inventory sx={{ color: 'primary.main', fontSize: 20 }} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {override.item?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={override.par_level} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={override.order_point} size="small" color="warning" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Schedule fontSize="small" />}
                          label={getFrequencyLabel(override.count_frequency)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {override.storage_location || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={override.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={override.is_active ? 'success' : 'default'}
                          variant={override.is_active ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(override)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteClick(override)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {overrides.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Tune sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No overrides for this location
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add custom settings for items at this location
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>
      )}

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingOverride ? 'Edit Override' : 'Add New Override'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                select
                label="Item"
                value={formData.catalog_item}
                onChange={(e) => setFormData({ ...formData, catalog_item: e.target.value })}
                required
                fullWidth
                disabled={!!editingOverride}
              >
                <MenuItem value="">Select an item</MenuItem>
                {catalogItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Par Level"
                  type="number"
                  value={formData.par_level}
                  onChange={(e) => setFormData({ ...formData, par_level: parseInt(e.target.value) || 0 })}
                  inputProps={{ min: 0 }}
                  required
                />
                <TextField
                  label="Order Point"
                  type="number"
                  value={formData.order_point}
                  onChange={(e) => setFormData({ ...formData, order_point: parseInt(e.target.value) || 0 })}
                  inputProps={{ min: 0 }}
                  required
                />
              </Box>
              <TextField
                select
                label="Count Frequency"
                value={formData.count_frequency}
                onChange={(e) => setFormData({ ...formData, count_frequency: e.target.value })}
                fullWidth
              >
                {FREQUENCIES.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>{freq.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Storage Location"
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                placeholder="e.g., Walk-in Cooler"
                fullWidth
              />
              <TextField
                label="Min Order Qty"
                type="number"
                value={formData.min_order_qty}
                onChange={(e) => setFormData({ ...formData, min_order_qty: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeModal} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{editingOverride ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this override? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OverridesView;

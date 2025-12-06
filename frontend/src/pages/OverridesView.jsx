import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Button,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Typography,
  Select,
  Collapse,
} from '@mui/material';
import { Add, Schedule, Inventory, LocationOn, Close } from '@mui/icons-material';

import Header from '../components/Header';
import Table from '../components/Table';
import overridesAPI from '../services/overridesAPI';
import locationsAPI from '../services/locationsAPI';
import catalogAPI from '../services/catalogAPI';
import { showNotification } from '../store/slices/uiSlice';

const FREQUENCIES = [
  { value: 'mon_wed', label: 'Mon/Wed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'semiannual', label: 'Semi-Annual' },
];

const OverridesView = () => {
  const dispatch = useDispatch();

  const [overrides, setOverrides] = useState([]);
  const [locations, setLocations] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);

  const [formData, setFormData] = useState({
    catalog_item: '',
    location_id: '',
    par_level: 10,
    order_point: 5,
    count_frequency: 'weekly',
    storage_location: '',
    min_order_qty: 1,
    is_active: true,
  });

  // ----------------- Fetchers -----------------
  const fetchLocations = useCallback(async () => {
    try {
      const { data } = await locationsAPI.getAll();
      const locs = data?.results ?? [];
      setLocations(locs);
      if (!selectedLocation && locs.length > 0) {
        setSelectedLocation(locs[0].id);
      }
    } catch (error) {
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    }
  }, [dispatch, selectedLocation]);

  const fetchCatalogItems = useCallback(async () => {
    try {
      const { data } = await catalogAPI.getAll();
      setCatalogItems(data?.results ?? []);
    } catch (error) {
      dispatch(showNotification({ message: 'Failed to fetch catalog items', type: 'error' }));
    }
  }, [dispatch]);

  const fetchOverrides = useCallback(async () => {
    if (!selectedLocation) return;
    setLoading(true);
    try {
      const data = await overridesAPI.getAll(selectedLocation);
      setOverrides(data?.results ?? []);
    } catch (error) {
      dispatch(showNotification({ message: 'Failed to fetch overrides', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, dispatch]);

  useEffect(() => {
    fetchLocations();
    fetchCatalogItems();
  }, [fetchLocations, fetchCatalogItems]);

  useEffect(() => {
    fetchOverrides();
  }, [selectedLocation, fetchOverrides]);

  // ----------------- Dialog Handlers -----------------
  const openDialog = (override = null) => {
    if (override) {
      setEditingOverride(override);
      setFormData({
        catalog_item: override.item?.id ?? override.item ?? '',
        location_id: override.location_id,
        par_level: override.par_level ?? 10,
        order_point: override.order_point ?? 5,
        count_frequency: override.frequency ?? override.count_frequency ?? 'weekly',
        storage_location: override.storage_location ?? '',
        min_order_qty: override.min_order_qty ?? 1,
        is_active: override.is_active ?? true,
      });
    } else {
      setEditingOverride(null);
      setFormData({
        catalog_item: '',
        location_id: selectedLocation,
        par_level: 10,
        order_point: 5,
        count_frequency: 'weekly',
        storage_location: '',
        min_order_qty: 1,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingOverride(null);
    setFormData({
      catalog_item: '',
      location_id: selectedLocation,
      par_level: 10,
      order_point: 5,
      count_frequency: 'weekly',
      storage_location: '',
      min_order_qty: 1,
      is_active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        location_id: Number(formData.location_id),
        item_id: Number(formData.catalog_item),
        par_level: Number(formData.par_level),
        order_point: Number(formData.order_point),
        frequency: formData.count_frequency,
        storage_location: formData.storage_location,
        min_order_qty: Number(formData.min_order_qty),
        is_active: formData.is_active,
      };

      if (editingOverride) {
        await overridesAPI.update(editingOverride.id, payload);
        dispatch(showNotification({ message: 'Override updated successfully', type: 'success' }));
      } else {
        const exists = overrides.some(o => (o.item?.id ?? o.item) === Number(formData.catalog_item));
        if (exists) {
          const existing = overrides.find(o => (o.item?.id ?? o.item) === Number(formData.catalog_item));
          openDialog(existing);
          dispatch(showNotification({ message: 'Override already exists. Opening for edit...', type: 'info' }));
          return;
        }
        await overridesAPI.create(payload);
        dispatch(showNotification({ message: 'Override created successfully', type: 'success' }));
      }

      fetchOverrides();
      closeDialog();
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to save override', type: 'error' }));
    }
  };

  const getFrequencyLabel = useCallback((freq) => {
    return FREQUENCIES.find(f => f.value === freq)?.label || freq;
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Item',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Inventory sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="subtitle2">{row.item_name ?? 'Unknown Item'}</Typography>
        </Box>
      ),
    },
    { header: 'Par Level', render: (row) => <Chip label={row.par_level} size="small" color="primary" variant="outlined" /> },
    { header: 'Order Point', render: (row) => <Chip label={row.order_point} size="small" color="warning" variant="outlined" /> },
    {
      header: 'Frequency',
      render: (row) => (
        <Chip
          icon={<Schedule fontSize="small" />}
          label={getFrequencyLabel(row.frequency ?? row.count_frequency)}
          size="small"
          variant="outlined"
        />
      ),
    },
    { header: 'Storage', render: (row) => row.storage_location || '-' },
    {
      header: 'Status',
      render: (row) => (
        <Chip
          label={row.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={row.is_active ? 'success' : 'default'}
          variant={row.is_active ? 'filled' : 'outlined'}
        />
      ),
    },
  ], [getFrequencyLabel]);

  return (
    <Box>
      <Header
        title="Location Overrides"
        subtitle="Customize inventory settings per location"
        showRefresh
        onRefresh={fetchOverrides}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            size="small"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            sx={{ minWidth: 220 }}
            SelectProps={{ native: false }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="action" />
                </InputAdornment>
              ),
            }}
          >
            {locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openDialog()}
            sx={{ bgcolor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            Add Override
          </Button>
        </Box>
      </Header>

      <Collapse in>
        <Card sx={{ mt: 3 }}>
          <Table
            columns={columns}
            data={overrides}
            loading={loading}
            actions={(row) => (
              <Button size="small" variant="outlined" onClick={() => openDialog(row)}>
                Edit
              </Button>
            )}
          />
        </Card>
      </Collapse>

      {/* MUI Dialog - Custom Modal Replaced */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {editingOverride ? 'Edit Override' : 'Add New Override'}
          <IconButton
            onClick={closeDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              <FormControl fullWidth>
                <InputLabel>Catalog Item *</InputLabel>
                <Select
                  value={formData.catalog_item}
                  label="Catalog Item *"
                  onChange={(e) => setFormData({ ...formData, catalog_item: e.target.value })}
                  required
                >
                  {catalogItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Par Level"
                type="number"
                value={formData.par_level}
                onChange={(e) => setFormData({ ...formData, par_level: Number(e.target.value) || 0 })}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />

              <TextField
                label="Order Point"
                type="number"
                value={formData.order_point}
                onChange={(e) => setFormData({ ...formData, order_point: Number(e.target.value) || 0 })}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />

              <FormControl fullWidth>
                <InputLabel>Count Frequency</InputLabel>
                <Select
                  value={formData.count_frequency}
                  label="Count Frequency"
                  onChange={(e) => setFormData({ ...formData, count_frequency: e.target.value })}
                >
                  {FREQUENCIES.map((f) => (
                    <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Storage Location (Optional)"
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                fullWidth
              />

              <TextField
                label="Minimum Order Quantity"
                type="number"
                value={formData.min_order_qty}
                onChange={(e) => setFormData({ ...formData, min_order_qty: Number(e.target.value) || 1 })}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingOverride ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default OverridesView;
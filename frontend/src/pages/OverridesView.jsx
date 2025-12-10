import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

import { showNotification } from '../store/slices/uiSlice';
import {
  fetchOverrides,
  createOverride,
  updateOverride,
  setSelectedLocation,
} from '../store/slices/overrideSlice';

import locationsAPI from '../services/locationsAPI';
import catalogAPI from '../services/catalogAPI';

// ---------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------
const FREQUENCIES = [
  { value: 'mon_wed', label: 'Mon/Wed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'semiannual', label: 'Semi-Annual' },
];

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------
const OverridesView = () => {
  const dispatch = useDispatch();
  const { items: overrides, loading, selectedLocation } = useSelector(
    (state) => state.overrides
  );

  // -------------------------------------------------------------------
  // Local State
  // -------------------------------------------------------------------
  const [locations, setLocations] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);

  // Dialog State
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
    count: 1,
    is_active: true,
  });

  // -------------------------------------------------------------------
  // Fetch Locations
  // -------------------------------------------------------------------
  const fetchLocations = useCallback(async () => {
    try {
      const { data } = await locationsAPI.getAll();
      const locs = data?.results ?? [];

      setLocations(locs);

      // If nothing selected, select the first available location
      if (!selectedLocation && locs.length > 0) {
        dispatch(setSelectedLocation(locs[0].id));
      }
    } catch (error) {
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    }
  }, [dispatch, selectedLocation]);

  // -------------------------------------------------------------------
  // Fetch Catalog Items
  // -------------------------------------------------------------------
  const fetchCatalogItems = useCallback(async () => {
    try {
      const { data } = await catalogAPI.getAll();
      setCatalogItems(data?.results ?? []);
    } catch (error) {
      dispatch(showNotification({ message: 'Failed to fetch catalog items', type: 'error' }));
    }
  }, [dispatch]);

  // -------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------
  useEffect(() => {
    fetchLocations();
    fetchCatalogItems();
  }, [fetchLocations, fetchCatalogItems]);

  useEffect(() => {
    if (selectedLocation) {
      dispatch(fetchOverrides(selectedLocation));
    }
  }, [dispatch, selectedLocation]);

  // -------------------------------------------------------------------
  // Dialog Handlers
  // -------------------------------------------------------------------
  const openDialog = (override = null) => {
    if (override) {
      setEditingOverride(override);

      setFormData({
        catalog_item: override.item_id ?? override.item ?? '',
        location_id: override.location_id ?? selectedLocation ?? '',
        par_level: override.par_level ?? 10,
        order_point: override.order_point ?? 5,
        count_frequency: override.frequency ?? override.count_frequency ?? 'weekly',
        storage_location: override.storage_location ?? '',
        min_order_qty: override.min_order_qty ?? 1,
        count: override.count ?? overrides.count ?? 1,
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
        count: overrides.count ?? 1,
        is_active: true,
      });
    }

    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingOverride(null);

    // Reset count to top-level count
    setFormData((f) => ({ ...f, count: overrides.count ?? 1 }));
  };

  // -------------------------------------------------------------------
  // Submit Handler
  // -------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!editingOverride) {
        const payload = {
          location_id: Number(formData.location_id),
          item_id: Number(formData.catalog_item),
          par_level: Number(formData.par_level),
          order_point: Number(formData.order_point),
          frequency: formData.count_frequency,
          storage_location: formData.storage_location,
          min_order_qty: Number(formData.min_order_qty),
          count: Number(formData.count),
          is_active: formData.is_active,
        };

        await dispatch(createOverride(payload));
      } else {
        const payload = {
          id: editingOverride.id,
          location_id: Number(formData.location_id || editingOverride.location_id),
          item_id: Number(formData.catalog_item || editingOverride.item_id),
          par_level: Number(formData.par_level ?? editingOverride.par_level),
          order_point: Number(formData.order_point ?? editingOverride.order_point),
          frequency: formData.count_frequency || editingOverride.frequency,
          storage_location: formData.storage_location ?? editingOverride.storage_location,
          min_order_qty: Number(formData.min_order_qty ?? editingOverride.min_order_qty),
          count: Number(formData.count ?? editingOverride.count ?? overrides.count ?? 1),
          is_active: formData.is_active ?? editingOverride.is_active,
        };

        await dispatch(updateOverride({ id: editingOverride.id, payload }));
      }

      closeDialog();
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to save override', type: 'error' }));
    }
  };

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  const getFrequencyLabel = useCallback(
    (freq) => FREQUENCIES.find((f) => f.value === freq)?.label || freq,
    []
  );

  // -------------------------------------------------------------------
  // Table Columns
  // -------------------------------------------------------------------
  const columns = useMemo(
    () => [
      {
        header: 'Item',
        render: (row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="subtitle2">
              {row.item_name ?? 'Unknown Item'}
            </Typography>
          </Box>
        ),
      },
      {
        header: 'Par Level',
        render: (row) => (
          <Chip label={row.par_level} size="small" color="primary" variant="outlined" />
        ),
      },
      {
        header: 'Order Point',
        render: (row) => (
          <Chip label={row.order_point} size="small" color="warning" variant="outlined" />
        ),
      },
      {
        header: 'Count',
        render: (row) => (
          <Chip label={row.count ?? 1} size="small" color="info" variant="outlined" />
        ),
      },
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
    ],
    [getFrequencyLabel]
  );

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <Box>
      <Header
        title="Location Overrides"
        subtitle="Customize inventory settings per location"
        showRefresh
        onRefresh={() => dispatch(fetchOverrides(selectedLocation))}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            size="small"
            value={selectedLocation}
            onChange={(e) => dispatch(setSelectedLocation(e.target.value))}
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
            sx={{
              bgcolor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            Add Override
          </Button>

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2">
              Total Count: {overrides.count ?? 0}
            </Typography>
          </Box>
        </Box>
      </Header>

      <Collapse in>
        <Card sx={{ mt: 3 }}>
          <Table
            columns={columns}
            data={overrides.results}
            loading={loading}
            actions={(row) => (
              <Button size="small" variant="outlined" onClick={() => openDialog(row)}>
                Edit
              </Button>
            )}
          />
        </Card>
      </Collapse>

      {/* Dialog */}
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
                  onChange={(e) =>
                    setFormData({ ...formData, catalog_item: e.target.value })
                  }
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
                onChange={(e) =>
                  setFormData({ ...formData, par_level: Number(e.target.value) || 0 })
                }
                required
                fullWidth
                inputProps={{ min: 0 }}
              />

              <TextField
                label="Order Point"
                type="number"
                value={formData.order_point}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_point: Number(e.target.value) || 0,
                  })
                }
                required
                fullWidth
                inputProps={{ min: 0 }}
              />

              <TextField
                label="Count"
                type="number"
                value={formData.count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    count: Number(e.target.value) || 1,
                  })
                }
                required
                fullWidth
                inputProps={{ min: 1 }}
              />

              <FormControl fullWidth>
                <InputLabel>Count Frequency</InputLabel>
                <Select
                  value={formData.count_frequency}
                  label="Count Frequency"
                  onChange={(e) =>
                    setFormData({ ...formData, count_frequency: e.target.value })
                  }
                >
                  {FREQUENCIES.map((f) => (
                    <MenuItem key={f.value} value={f.value}>
                      {f.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Storage Location (Optional)"
                value={formData.storage_location}
                onChange={(e) =>
                  setFormData({ ...formData, storage_location: e.target.value })
                }
                fullWidth
              />

              <TextField
                label="Minimum Order Quantity"
                type="number"
                value={formData.min_order_qty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_order_qty: Number(e.target.value) || 1,
                  })
                }
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

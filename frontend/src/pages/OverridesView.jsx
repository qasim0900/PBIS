import Modal from '../components/Modal';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Button,
  Chip,
  TextField,
  Collapse,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Add, Schedule, Inventory, LocationOn } from '@mui/icons-material';
import Header from '../components/Header';
import Table from '../components/Table';
import overridesAPI from '../services/overridesAPI';
import locationsAPI from '../services/locationsAPI';
import catalogAPI from '../services/catalogAPI';
import { showNotification } from '../store/slices/uiSlice';

// Config / Constants
const FREQUENCIES = [
  { value: 'mon_wed', label: 'Mon/Wed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'semiannual', label: 'Semi-Annual' },
];

const OverridesView = () => {
  const dispatch = useDispatch();

  // State
  const [overrides, setOverrides] = useState([]);
  const [locations, setLocations] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
      if (!selectedLocation && locs.length) setSelectedLocation(locs[0]?.id ?? '');
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    }
  }, [dispatch, selectedLocation]);

  const fetchCatalogItems = useCallback(async () => {
    try {
      const { data } = await catalogAPI.getAll();
      setCatalogItems(data?.results ?? []);
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to fetch catalog items', type: 'error' }));
    }
  }, [dispatch]);

  const fetchOverrides = useCallback(async () => {
    if (!selectedLocation) return;
    setLoading(true);
    try {
      const { data } = await overridesAPI.getAll(selectedLocation);
      setOverrides(data?.results ?? []);
    } catch (error) {
      console.error(error);
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

  // ----------------- Form Handlers -----------------
  const resetForm = () => {
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
    setModalOpen(false);
  };

  const handleEdit = (override) => {
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
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        location_id: Number(formData.location_id),
        item_id: formData.catalog_item,
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
        const exists = overrides.some((o) => (o.item?.id ?? o.item) === Number(formData.catalog_item));
        if (exists) {
          handleEdit(overrides.find((o) => (o.item?.id ?? o.item) === Number(formData.catalog_item)));
          dispatch(showNotification({ message: 'Override exists. Editing...', type: 'info' }));
          return;
        }
        await overridesAPI.create(payload);
        dispatch(showNotification({ message: 'Override created successfully', type: 'success' }));
      }
      fetchOverrides();
      resetForm();
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to save override', type: 'error' }));
    }
  };

  const getFrequencyLabel = useCallback((freq) => FREQUENCIES.find(f => f.value === freq)?.label ?? freq, []);

  // ----------------- Table Columns -----------------
  const columns = useMemo(() => [
    {
      header: 'Item',
      accessor: 'item_name',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Inventory sx={{ color: 'primary.main', fontSize: 20 }} />
          </Box>
          {row.item_name ?? 'Unknown'}
        </Box>
      ),
    },
    {
      header: 'Par Level',
      accessor: 'par_level',
      render: (row) => <Chip label={row.par_level} size="small" color="primary" variant="outlined" />,
    },
    {
      header: 'Order Point',
      accessor: 'order_point',
      render: (row) => <Chip label={row.order_point} size="small" color="warning" variant="outlined" />,
    },
    {
      header: 'Frequency',
      accessor: 'frequency',
      render: (row) => (
        <Chip
          label={getFrequencyLabel(row.frequency ?? row.count_frequency)}
          size="small"
          variant="outlined"
          icon={<Schedule fontSize="small" />}
        />
      ),
    },
    {
      header: 'Storage',
      accessor: 'storage_location',
      render: (row) => row.storage_location ?? '-',
    },
    {
      header: 'Status',
      accessor: 'is_active',
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

  // ----------------- Render -----------------
  return (
    <Box>
      <Header
        title="Location Overrides"
        subtitle="Customize inventory settings per location"
        showRefresh
        onRefresh={fetchOverrides}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
          <TextField
            select
            size="small"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(Number(e.target.value))}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          >
            {locations.map(loc => (
              <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
          >
            Add Override
          </Button>
        </Box>
      </Header>

      <Collapse in>
        <Card sx={{ mt: 2, p: 2 }}>
          <Table
            columns={columns}
            data={overrides}
            actions={(row) => (
              <Button size="small" variant="outlined" color="primary" onClick={() => handleEdit(row)}>Edit</Button>
            )}
            loading={loading}
          />
        </Card>
      </Collapse>

      {/* Custom Modal */}
      <Modal open={modalOpen} onClose={resetForm} title={editingOverride ? 'Edit Override' : 'Add New Override'}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              select
              label="Catalog Item"
              value={formData.catalog_item}
              onChange={e => setFormData({ ...formData, catalog_item: e.target.value })}
              required
              fullWidth
            >
              {catalogItems.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
            </TextField>

            <TextField
              label="Par Level"
              type="number"
              value={formData.par_level}
              onChange={e => setFormData({ ...formData, par_level: Number(e.target.value) || 0 })}
              required
              fullWidth
            />

            <TextField
              label="Order Point"
              type="number"
              value={formData.order_point}
              onChange={e => setFormData({ ...formData, order_point: Number(e.target.value) || 0 })}
              required
              fullWidth
            />

            <TextField
              select
              label="Count Frequency"
              value={formData.count_frequency}
              onChange={e => setFormData({ ...formData, count_frequency: e.target.value })}
              required
              fullWidth
            >
              {FREQUENCIES.map(f => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
            </TextField>

            <TextField
              label="Storage Location"
              value={formData.storage_location}
              onChange={e => setFormData({ ...formData, storage_location: e.target.value })}
              fullWidth
            />

            <TextField
              label="Minimum Order Quantity"
              type="number"
              value={formData.min_order_qty}
              onChange={e => setFormData({ ...formData, min_order_qty: Number(e.target.value) || 1 })}
              required
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={resetForm} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{editingOverride ? 'Update' : 'Create'}</Button>
          </Box>
        </form>
      </Modal>
    </Box>
  );
};

export default OverridesView;

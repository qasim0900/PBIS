import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Tooltip,
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
  const [catalogLocationItems, setCatalogLocationItems] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);
  const [formData, setFormData] = useState({
    catalog_item: '',
    location: '',
    par_level: 10,
    order_point: 5,
    count_frequency: 'weekly',
    storage_location: '',
    min_order_qty: 1,
    is_active: true,
  });

  // ------------------- FETCH -------------------

  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationsAPI.getAll();
      const locs = response.data.results || response.data || [];
      setLocations(locs);
      if (locs.length > 0) setSelectedLocation(Number(locs[0].id));
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    }
  }, [dispatch]);

  const fetchCatalogItems = useCallback(async () => {
    try {
      const response = await catalogAPI.getAll();
      setCatalogItems(response.data.results || response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchCatalogLocation = useCallback(async () => {
    try {
      const response = await locationsAPI.getAll();
      setCatalogLocationItems(response.data.results || response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchOverrides = useCallback(async () => {
    setLoading(true);
    try {
      const response = await overridesAPI.getAll(selectedLocation);
      setOverrides(response.data.results || response.data || []);
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
    fetchCatalogLocation();
  }, [fetchLocations, fetchCatalogItems, fetchCatalogLocation]);

  useEffect(() => {
    if (selectedLocation) fetchOverrides();
  }, [selectedLocation, fetchOverrides]);

  // ------------------- FORM HANDLERS -------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payloadLocationId = Number(formData.location_id || selectedLocation);
      const data = {
        location_id: payloadLocationId,
        item_id: formData.catalog_item,
        par_level: formData.par_level,
        order_point: formData.order_point,
        frequency: formData.count_frequency,
        storage_location: formData.storage_location,
        min_order_qty: formData.min_order_qty,
        is_active: formData.is_active,
      };

      if (editingOverride) {
        await overridesAPI.update(editingOverride.id, data);
        dispatch(showNotification({ message: 'Override updated successfully', type: 'success' }));
      } else {
        const exists = overrides.some((o) => (o.item?.id || o.item) === Number(formData.catalog_item));
        if (exists) {
          const existingOverride = overrides.find((o) => (o.item?.id || o.item) === Number(formData.catalog_item));
          dispatch(showNotification({ message: 'Override exists. Editing...', type: 'info' }));
          handleEdit(existingOverride);
          return;
        }
        await overridesAPI.create(data);
        dispatch(showNotification({ message: 'Override created successfully', type: 'success' }));
      }

      fetchOverrides();
      closeModal();
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to save override', type: 'error' }));
    }
  };

  const handleEdit = (override) => {
    setEditingOverride(override);
    setFormData({
      catalog_item: override.item?.id || override.item,
      location_id: override.location_id,
      location: override.location,
      par_level: override.par_level,
      order_point: override.order_point,
      count_frequency: override.frequency || override.count_frequency,
      storage_location: override.storage_location || '',
      min_order_qty: override.min_order_qty || 1,
      is_active: override.is_active,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOverride(null);
    setFormData({
      catalog_item: '',
      location_id: '',
      par_level: 10,
      order_point: 5,
      count_frequency: 'weekly',
      storage_location: '',
      min_order_qty: 1,
      is_active: true,
    });
  };

  const getFrequencyLabel = (freq) => FREQUENCIES.find(f => f.value === freq)?.label || freq;

  // ------------------- TABLE COLUMNS -------------------

  const columns = [
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
          {row.item_name || 'Unknown'}
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
        <Chip label={getFrequencyLabel(row.frequency || row.count_frequency)} size="small" variant="outlined" icon={<Schedule fontSize="small" />} />
      ),
    },
    {
      header: 'Storage',
      accessor: 'storage_location',
      render: (row) => row.storage_location || '-',
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
  ];

  return (
    <Box>
      <Header
        title="Location Overrides"
        subtitle="Customize inventory settings per location"
        showRefresh
        onRefresh={fetchOverrides}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: { xs: 'stretch', sm: 'center' },
            mt: 1,
            flexWrap: 'wrap',
          }}
        >
          {/* Location Field */}
          <TextField
            select
            size="small"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(Number(e.target.value))}
            sx={{ minWidth: 200, flexGrow: { xs: 1, sm: 0 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="action" fontSize="small" />
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

          {/* Add Button */}
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
            onClick={() => {
              setFormData({
                catalog_item: '',
                location_id: selectedLocation,
                location: locations.find((loc) => loc.id === Number(selectedLocation))?.name || '',
                par_level: 10,
                order_point: 5,
                count_frequency: 'weekly',
                storage_location: '',
                min_order_qty: 1,
                is_active: true,
              });
              setModalOpen(true);
            }}
          >
            Add Override
          </Button>
        </Box>
      </Header>

      <Collapse in={true}>
        <Card sx={{ mt: 2, p: 2 }}>
          <Table
            columns={columns}
            data={overrides}
            actions={(row) => (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleEdit(row)}
                sx={{ minWidth: 80 }}
              >
                Edit
              </Button>
            )}
          />
        </Card>
      </Collapse>

      {/* ------------------- MODAL ------------------- */}
Bhai, khuda ka wasta hai — maine sirf modal banaya hai, baaki code mein ek bhi line nahi chhudi!
Yeh bilkul exact wahi fields jo tumhare API se aa rahe hain (string numbers bhi handle kar diye):
jsx{/* ------------------- MODAL (SIRF YEHI CHANGE KIYA) ------------------- */}
<Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
  <form onSubmit={handleSubmit}>
    <DialogTitle>{editingOverride ? 'Edit Override' : 'Add New Override'}</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>

        {/* Catalog Item */}
        <TextField
          select
          label="Catalog Item"
          value={formData.catalog_item}
          onChange={(e) => setFormData({ ...formData, catalog_item: e.target.value })}
          required
          fullWidth
        >
          {catalogItems.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Par Level */}
        <TextField
          label="Par Level"
          type="number"
          value={formData.par_level}
          onChange={(e) => setFormData({ ...formData, par_level: Number(e.target.value) || 0 })}
          InputProps={{ inputProps: { min: 0, step: "0.01" } }}
          required
          fullWidth
        />

        {/* Order Point */}
        <TextField
          label="Order Point"
          type="number"
          value={formData.order_point}
          onChange={(e) => setFormData({ ...formData, order_point: Number(e.target.value) || 0 })}
          InputProps={{ inputProps: { min: 0, step: "0.01" } }}
          required
          fullWidth
        />

        {/* Frequency */}
        <TextField
          select
          label="Count Frequency"
          value={formData.count_frequency}
          onChange={(e) => setFormData({ ...formData, count_frequency: e.target.value })}
          required
          fullWidth
        >
          {FREQUENCIES.map((freq) => (
            <MenuItem key={freq.value} value={freq.value}>
              {freq.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Storage Location */}
        <TextField
          label="Storage Location"
          value={formData.storage_location}
          onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
          placeholder="e.g., Freezer, Dry Storage, Back Room"
          fullWidth
        />

        {/* Minimum Order Quantity */}
        <TextField
          label="Minimum Order Quantity"
          type="number"
          value={formData.min_order_qty}
          onChange={(e) => setFormData({ ...formData, min_order_qty: Number(e.target.value) || 1 })}
          InputProps={{ inputProps: { min: 1, step: "0.01" } }}
          required
          fullWidth
        />

      </Box>
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button onClick={closeModal} color="inherit">
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
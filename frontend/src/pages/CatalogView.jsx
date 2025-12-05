import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Add, Inventory, Close } from '@mui/icons-material';
import Header from '../components/Header';
import Table from '../components/Table';
import catalogAPI from '../services/catalogAPI';
import { showNotification } from '../store/slices/uiSlice';

const CATEGORIES = [
  { value: 'fruit', label: 'Fruit', color: '#10b981' },
  { value: 'dairy', label: 'Dairy', color: '#3b82f6' },
  { value: 'dry', label: 'Dry Goods', color: '#f59e0b' },
  { value: 'packaging', label: 'Packaging', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#64748b' },
];

const UNITS = ['bags', 'cans', 'boxes', 'pcs', 'kg', 'liters', 'cases', 'packs'];

const DEFAULT_FORM = {
  name: '',
  category: 'fruit',
  count_unit: 'bags',
  order_unit: 'case',
  pack_size: 1,
  is_active: true,
};

const CatalogView = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  // Fetch all catalog items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await catalogAPI.getAll();
      setItems(data.results || data || []);
    } catch (err) {
      dispatch(showNotification({ message: 'Failed to load items', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Modal open handlers
  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item ? {
      name: item.name,
      category: item.category,
      count_unit: item.count_unit,
      order_unit: item.order_unit,
      pack_size: item.pack_size || 1,
      is_active: item.is_active,
    } : DEFAULT_FORM);
    setModalOpen(true);
  };

  // Save item (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      return dispatch(showNotification({ message: 'Item name is required!', type: 'error' }));
    }

    setSaving(true);
    try {
      if (editingItem) {
        await catalogAPI.update(editingItem.id, formData);
        dispatch(showNotification({ message: 'Item updated successfully!', type: 'success' }));
      } else {
        await catalogAPI.create(formData);
        dispatch(showNotification({ message: 'Item added successfully!', type: 'success' }));
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || 'Failed to save item';
      dispatch(showNotification({ message: msg, type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || '#64748b';

  const columns = [
    {
      header: 'Item Name',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: `${getCategoryColor(row.category)}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inventory sx={{ color: getCategoryColor(row.category) }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>{row.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {CATEGORIES.find(c => c.value === row.category)?.label || row.category}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { header: 'Count Unit', accessor: 'count_unit' },
    { header: 'Order Unit', accessor: 'order_unit' },
    { header: 'Pack Size', render: (row) => `${row.pack_size || 1}x` },
    {
      header: 'Status',
      render: (row) => (
        <Chip
          label={row.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={row.is_active ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <Button size="small" variant="outlined" color="primary" onClick={() => openModal(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Header
        title="Catalog Items"
        subtitle={`Total items: ${items.length}`}
        showRefresh
        onRefresh={fetchItems}
      >
        <Button variant="contained" startIcon={<Add />} onClick={() => openModal()}>
          Add Item
        </Button>
      </Header>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table columns={columns} data={items} searchable />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
          <Button onClick={() => setModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Item Name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              autoFocus
            />
            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              fullWidth
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                label="Count Unit"
                value={formData.count_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, count_unit: e.target.value }))}
                fullWidth
              >
                {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Order Unit"
                value={formData.order_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, order_unit: e.target.value }))}
                fullWidth
              >
                {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Box>

            <TextField
              label="Pack Size"
              type="number"
              value={formData.pack_size}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, pack_size: Math.max(1, parseInt(e.target.value) || 1) }))
              }
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Item is Active"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formData.name.trim()}
          >
            {saving ? <CircularProgress size={20} /> : editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogView;

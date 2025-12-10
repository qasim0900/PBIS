import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
} from '@mui/material';
import { Add, Inventory, Close } from '@mui/icons-material';
import Header from '../components/Header';
import { showNotification } from '../store/slices/uiSlice';
import Table from '../components/Table';
import { fetchAllItems, createItem, updateItem, clearCurrentItem } from '../store/slices/catalogSlice';

const CATEGORIES = [
  { value: 'fruit', label: 'Fruit', color: '#10b981' },
  { value: 'dairy', label: 'Dairy', color: '#3b82f6' },
  { value: 'dry', label: 'Dry Goods', color: '#f59e0b' },
  { value: 'packaging', label: 'Packaging', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#64748b' },
];

const UNITS = ['bags', 'cans', 'boxes', 'pcs', 'kg', 'liters', 'cases', 'packs'];

const CatalogView = () => {
  const dispatch = useDispatch();
  const { items, currentItem } = useSelector((state) => state.catalog);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'fruit',
    count_unit: 'bags',
    order_unit: 'case',
    pack_size: 1,
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  const openAddModal = () => {
    dispatch(clearCurrentItem());
    setFormData({
      name: '',
      category: 'fruit',
      count_unit: 'bags',
      order_unit: 'case',
      pack_size: 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      count_unit: item.count_unit,
      order_unit: item.order_unit,
      pack_size: item.pack_size || 1,
      is_active: item.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      dispatch(showNotification({ message: 'Item name is required!', type: 'error' }));
      return;
    }

    setSaving(true);
    try {
      if (currentItem) {
        await dispatch(updateItem({ id: currentItem.id, data: formData })).unwrap();
        dispatch(showNotification({ message: 'Item updated successfully!', type: 'success' }));
      } else {
        await dispatch(createItem(formData)).unwrap();
        dispatch(showNotification({ message: 'Item added successfully!', type: 'success' }));
      }
      setModalOpen(false);
      dispatch(fetchAllItems());
    } catch (error) {
      const msg = error.name?.[0] || 'Failed to save item';
      dispatch(showNotification({ message: msg, type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (cat) => CATEGORIES.find((c) => c.value === cat)?.color || '#64748b';

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
            <Typography variant="subtitle1" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {CATEGORIES.find((c) => c.value === row.category)?.label || row.category}
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
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => openEditModal(row)}
          sx={{ minWidth: 80 }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Header title="Catalog Items" subtitle={`Total items: ${items.length}`} showRefresh onRefresh={() => dispatch(fetchAllItems())}>
        <Button variant="contained" startIcon={<Add />} onClick={openAddModal}>
          Add Item
        </Button>
      </Header>

      <Card>
        <CardContent>
          <Table columns={columns} data={items} searchable />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentItem ? 'Edit Item' : 'Add New Item'}
          <Button onClick={() => setModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              label="Item Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                select
                label="Count Unit"
                value={formData.count_unit}
                onChange={(e) => setFormData({ ...formData, count_unit: e.target.value })}
                fullWidth
              >
                {UNITS.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Order Unit"
                value={formData.order_unit}
                onChange={(e) => setFormData({ ...formData, order_unit: e.target.value })}
                fullWidth
              >
                {UNITS.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              label="Pack Size (e.g. 6 bags per case)"
              type="number"
              value={formData.pack_size}
              onChange={(e) =>
                setFormData({ ...formData, pack_size: Math.max(1, parseInt(e.target.value) || 1) })
              }
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Item is Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !formData.name.trim()}>
            {currentItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogView;

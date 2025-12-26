import TableView from '../../components/template';
import { Add, Inventory, Close } from '@mui/icons-material';
import {
    Box,
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
    IconButton,
} from '@mui/material';

const CATEGORIES = [
    { value: 'fruit', label: 'Fruit', color: '#10b981' },
    { value: 'dairy', label: 'Dairy', color: '#3b82f6' },
    { value: 'dry', label: 'Dry Goods', color: '#f59e0b' },
    { value: 'packaging', label: 'Packaging', color: '#8b5cf6' },
    { value: 'other', label: 'Other', color: '#64748b' },
];

const UNITS = ['bags', 'cans', 'boxes', 'pcs', 'kg', 'liters', 'cases', 'packs', 'case'];

const CatalogDesign = ({
    items,
    modalOpen,
    formData,
    setFormData,
    setModalOpen,
    openAddModal,
    openEditModal,
    handleSave,
    saving,
    currentItem,
}) => {
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
                        <Box component="span" sx={{ fontWeight: 600 }}>
                            {row.name}
                        </Box>
                        <Box sx={{ color: 'text.secondary', fontSize: 14 }}>
                            {CATEGORIES.find((c) => c.value === row.category)?.label || row.category}
                        </Box>
                    </Box>
                </Box>
            ),
        },
        { header: 'Count Unit', accessor: 'count_unit', align: 'center' },
        { header: 'Order Unit', accessor: 'order_unit', align: 'center' },
        { header: 'Pack Size', render: (row) => `${row.pack_size || 1}x`, align: 'center' },
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
            align: 'center',
        },
    ];

    const actions = (row) => (
        <Button size="small" variant="outlined" onClick={() => openEditModal(row)}>
            Edit
        </Button>
    );

    return (
        <>
            <TableView
                title="Catalog Items"
                subtitle={`Total items: ${items.length}`}
                columns={columns}
                data={items}
                actions={actions}
                extraHeaderActions={
                    <Button variant="contained" startIcon={<Add />} onClick={openAddModal}>
                        Add Item
                    </Button>
                }
                searchable={true}
                showRefresh={true}
                onRefresh={() => window.location.reload()}
                loading={false}
            />
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentItem ? 'Edit Item' : 'Add New Item'}
                    <IconButton
                        onClick={() => setModalOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
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
                                    <MenuItem key={u} value={u}>{u}</MenuItem>
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
                                    <MenuItem key={u} value={u}>{u}</MenuItem>
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
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !formData.name.trim()}
                    >
                        {currentItem ? 'Update Item' : 'Add Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CatalogDesign;
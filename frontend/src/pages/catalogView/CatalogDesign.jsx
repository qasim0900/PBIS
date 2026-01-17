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
    IconButton,
} from '@mui/material';

const CATEGORIES = [
    { value: 'fruit', label: 'Fruit', color: '#10b981' },
    { value: 'dairy', label: 'Dairy', color: '#3b82f6' },
    { value: 'dry', label: 'Dry Goods', color: '#f59e0b' },
    { value: 'packaging', label: 'Packaging', color: '#8b5cf6' },
    { value: 'other', label: 'Other', color: '#64748b' },
];

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
    locations,
    vendors,
    frequencies,
}) => {
    const getCategoryColor = (cat) =>
        CATEGORIES.find((c) => c.value === cat)?.color || '#64748b';

    /* ================= TABLE ================= */
    const columns = [
        {
            header: 'Item',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
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
                        <Box fontWeight={600}>{row.name}</Box>
                        <Box fontSize={13} color="text.secondary">
                            {row.category_display}
                        </Box>
                    </Box>
                </Box>
            ),
        },
        { header: 'Count Unit', accessor: 'count_unit', align: 'center' },
        { header: 'Order Unit', accessor: 'order_unit', align: 'center' },
        { header: 'Par Level', accessor: 'par_level', align: 'center' },
        {
            header: 'Status',
            render: (row) => (
                <Chip
                    label={row.is_active ? 'Active' : 'Inactive'}
                    color={row.is_active ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                />
            ),
            align: 'center',
        },
    ];

    return (
        <>
            <TableView
                title="Inventory Items"
                subtitle={`Total items: ${items.length}`}
                columns={columns}
                data={items}
                actions={(row) => (
                    <Button size="small" onClick={() => openEditModal(row)}>
                        Edit
                    </Button>
                )}
                extraHeaderActions={
                    <Button variant="contained" startIcon={<Add />} onClick={openAddModal}>
                        Add Item
                    </Button>
                }
                searchable
                showRefresh
            />

            {/* ================= MODAL ================= */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentItem ? 'Edit Item' : 'Add Item'}
                    <IconButton
                        onClick={() => setModalOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={1}>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            sx={{ gridColumn: '1 / -1' }}
                        />

                        <TextField select label="Category" value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                            {CATEGORIES.map((c) => (
                                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                            ))}
                        </TextField>

                        <TextField select label="Location" value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}>
                            {locations.map((l) => (
                                <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField label="Count Unit" value={formData.count_unit}
                            onChange={(e) => setFormData({ ...formData, count_unit: e.target.value })} />

                        <TextField label="Order Unit" value={formData.order_unit}
                            onChange={(e) => setFormData({ ...formData, order_unit: e.target.value })} />

                        <TextField select label="Frequency" value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}>
                            {frequencies.map((f) => (
                                <MenuItem key={f.id} value={f.id}>{f.days_range}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Vendor"
                            value={formData.vendor || ''}
                            onChange={(e) => {
                                const vendorId = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    vendor: vendorId,
                                    default_vendor: vendorId,
                                }));
                            }}
                            fullWidth
                        >
                            <MenuItem value="">— Select Vendor —</MenuItem>
                            {vendors.map(v => (
                                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField label="Par Level" type="number" value={formData.par_level}
                            onChange={(e) => setFormData({ ...formData, par_level: e.target.value })} />

                        <TextField label="Order Point" type="number" value={formData.order_point}
                            onChange={(e) => setFormData({ ...formData, order_point: e.target.value })} />

                        <TextField
                            label="Storage Location"
                            value={formData.storage_location}
                            onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                            sx={{ gridColumn: '1 / -1' }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {currentItem ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CatalogDesign;

import { motion, AnimatePresence } from 'framer-motion';
import TableView from '../../components/template';
import { Add, Inventory, Close, Edit } from '@mui/icons-material';
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

//-----------------------------------
// :: Motion Variants
//-----------------------------------
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const scaleIn = { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', duration: 0.3 } };

//-----------------------------------
// :: Categories
//-----------------------------------
const CATEGORIES = [
    { value: 'frozen_fruit', label: 'Frozen Fruit' },
    { value: 'supplements', label: 'Supplements' },
    { value: 'liquids', label: 'Liquids' },
    { value: 'fresh_produce', label: 'Fresh Produce' },
    { value: 'dry_stock', label: 'Dry Stock' },
    { value: 'cp_juices', label: 'CP Juices' },
    { value: 'shots', label: 'Shots' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'misc_items', label: 'Misc. Items' },
    { value: 'other', label: 'Other' },
];

//-----------------------------------
// :: CatalogDesign Component
//-----------------------------------
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
    brands,
    frequencies,
}) => {
    const getCategoryColor = (cat) => CATEGORIES.find((c) => c.value === cat)?.color || '#64748b';

    //-----------------------------------
    // :: Table Columns
    //-----------------------------------
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
                        <Box fontSize={13} color="text.secondary">{row.category_display}</Box>
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

    //-----------------------------------
    // :: Form Update Handler
    //-----------------------------------
    const updateForm = (key) => (e) => setFormData({ ...formData, [key]: e.target?.value ?? e });

    //-----------------------------------
    // :: Render
    //-----------------------------------
    return (
        <motion.div {...fadeIn}>
            {/* Inventory Table */}
            <TableView
                title="Inventory Items"
                subtitle={`Total items: ${items.length}`}
                columns={columns}
                data={items}
                actions={(row) => (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <IconButton size="small" color="primary" onClick={() => openEditModal(row)}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </motion.div>
                )}
                extraHeaderActions={
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={openAddModal}
                            sx={{ background: 'linear-gradient(90deg,#6366f1,#9333ea)', boxShadow: 3 }}
                        >
                            Add Item
                        </Button>
                    </motion.div>
                }
                searchable
                showRefresh
            />

            {/* Add/Edit Dialog */}
            <AnimatePresence>
                {modalOpen && (
                    <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                        <motion.div {...scaleIn}>
                            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ fontWeight: 'bold', background: 'linear-gradient(90deg,#4f46e5,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {currentItem ? 'Edit Item' : 'Add Item'}
                                </Box>
                                <IconButton onClick={() => setModalOpen(false)} size="small">
                                    <Close />
                                </IconButton>
                            </DialogTitle>

                            <DialogContent dividers>
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                                    <TextField
                                        label="Name"
                                        value={formData.name}
                                        onChange={updateForm('name')}
                                        fullWidth
                                        sx={{ gridColumn: '1 / -1' }}
                                    />
                                    <TextField select label="Category" value={formData.category} onChange={updateForm('category')}>
                                        {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                                    </TextField>
                                    <TextField select label="Location" value={formData.location} onChange={updateForm('location')}>
                                        {(locations || []).map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                                    </TextField>
                                    <TextField label="Count Unit" value={formData.count_unit} onChange={updateForm('count_unit')} />
                                    <TextField label="Order Unit" value={formData.order_unit} onChange={updateForm('order_unit')} />
                                    <TextField select label="Inventory List" value={formData.frequency || ''} onChange={updateForm('frequency')}>
                                        <MenuItem value="">— Select Inventory List —</MenuItem>
                                        {(frequencies || []).map(f => <MenuItem key={f.id} value={f.id}>{f.frequency_name}</MenuItem>)}
                                    </TextField>
                                    <TextField select label="Vendor" value={formData.vendor || ''} onChange={(e) => {
                                        const vendorId = e.target.value;
                                        setFormData(prev => ({ ...prev, vendor: vendorId, default_vendor: vendorId }));
                                    }}>
                                        <MenuItem value="">— Select Vendor —</MenuItem>
                                        {(vendors || []).map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                                    </TextField>
                                    <TextField select label="Brand" value={formData.brand || ''} onChange={updateForm('brand')}>
                                        <MenuItem value="">— Select Brand —</MenuItem>
                                        {(brands || []).map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                                    </TextField>
                                    <TextField label="Par Level" type="number" value={formData.par_level} onChange={updateForm('par_level')} />
                                    <TextField label="Order Point" type="number" value={formData.order_point} onChange={updateForm('order_point')} />
                                    <TextField label="Storage Location" value={formData.storage_location} onChange={updateForm('storage_location')} />
                                    <TextField
                                        label="Notes"
                                        value={formData.notes || ''}
                                        onChange={updateForm('notes')}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        sx={{ gridColumn: '1 / -1' }}
                                    />
                                </Box>
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                                        {currentItem ? 'Update' : 'Create'}
                                    </Button>
                                </motion.div>
                            </DialogActions>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CatalogDesign;
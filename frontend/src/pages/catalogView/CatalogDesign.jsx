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
    Typography,
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
// :: Form Section Component
//-----------------------------------
const FormSection = ({ title, description, children }) => (
    <Box sx={{ gridColumn: '1 / -1', mt: 3 }}>
        <Box sx={{ mb: 2 }}>
            <Typography fontWeight={600} fontSize={16}>{title}</Typography>
            {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {children}
        </Box>
    </Box>
);

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
    fieldErrors = {},
    isAdmin = false,
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
    const updateForm = (key, options = {}) => (e) => {
        let value = e.target?.value ?? e;
        if (options.textOnly) {
            value = value.replace(/[0-9]/g, '');
        }

        setFormData(key, value);
    };

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
                                <Box display="grid" gap={2}>
                                    {/* --- Basic Info Section --- */}
                                    <FormSection title="Basic Information" description="General details about the inventory item.">
                                        <TextField
                                            label="Item Name"
                                            value={formData.name}
                                            onChange={updateForm('name')}
                                            error={!!fieldErrors.name}
                                            helperText={fieldErrors.name}
                                        />
                                        <TextField
                                            select
                                            label="Category"
                                            value={formData.category}
                                            onChange={updateForm('category')}
                                            error={!!fieldErrors.category}
                                            helperText="If not listed, select 'Other'"
                                        >
                                            {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                                        </TextField>
                                        <TextField
                                            select
                                            label="Location"
                                            value={formData.location || ''}
                                            onChange={updateForm('location')}
                                            error={!!fieldErrors.location}
                                            helperText={fieldErrors.location}
                                        >
                                            <MenuItem value="">Select location</MenuItem>
                                            {(locations || []).map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                                        </TextField>
                                        <TextField
                                            select
                                            label="Inventory List"
                                            value={formData.frequency || ''}
                                            onChange={updateForm('frequency')}
                                        >
                                            <MenuItem value="">Select inventory list</MenuItem>
                                            {(frequencies || []).map((f) => <MenuItem key={f.id} value={f.id}>{f.frequency_name}</MenuItem>)}
                                        </TextField>
                                    </FormSection>

                                    {/* --- Inventory Configuration --- */}
                                    <FormSection title="Inventory Configuration" description="Define how this item is counted and ordered.">
                                        <TextField
                                            label="Count Unit"
                                            value={formData.count_unit}
                                            onChange={updateForm('count_unit', { textOnly: true })}
                                            helperText="e.g., cartons, bottles, bags"
                                        />
                                        <TextField
                                            label="Order Unit"
                                            value={formData.order_unit}
                                            onChange={updateForm('order_unit', { textOnly: true })}
                                            helperText="e.g., case, box, bundle"
                                        />
                                        <TextField
                                            label="Order Point"
                                            type="number"
                                            value={formData.order_point}
                                            onChange={updateForm('order_point')}
                                            helperText="Reorder when stock reaches this level"
                                        />
                                        <TextField
                                            label="Par Level"
                                            type="number"
                                            value={formData.par_level}
                                            onChange={updateForm('par_level')}
                                            helperText={isAdmin ? "Preferred stock level" : "Only administrators can modify this field"}
                                            disabled={!isAdmin && currentItem !== null}
                                            sx={{
                                                '& .MuiInputBase-input.Mui-disabled': {
                                                    color: isAdmin ? 'inherit' : 'text.secondary'
                                                }
                                            }}
                                        />
                                        <TextField
                                            label="Pack Size"
                                            type="number"
                                            value={formData.pack_size}
                                            onChange={updateForm('pack_size')}
                                            helperText="How many count units = 1 order unit"
                                        />

                                    </FormSection>

                                    {/* --- Vendor & Procurement --- */}
                                    <FormSection title="Vendor & Procurement" description="Supplier and purchasing configuration.">
                                        <TextField
                                            select
                                            label="Vendor (Optional)"
                                            value={formData.vendor || ''}
                                            onChange={(e) => setFormData('vendor', e.target.value || null)}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {(vendors || []).map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                                        </TextField>
                                        <TextField
                                            select
                                            label="Brand (Optional)"
                                            value={formData.brand || ''}
                                            onChange={(e) => setFormData('brand', e.target.value || null)}
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {(brands || []).map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                                        </TextField>
                                    </FormSection>

                                    {/* --- Additional Details --- */}
                                    <FormSection title="Additional Details" description="Optional storage and notes.">
                                        <TextField
                                            label="Storage Location (Optional)"
                                            value={formData.storage_location || ''}
                                            onChange={updateForm('storage_location')}
                                            helperText="e.g., Shelf A3, Freezer 2"
                                            sx={{ gridColumn: '1 / -1' }}
                                        />
                                        <TextField
                                            label="Notes (Optional)"
                                            value={formData.notes || ''}
                                            onChange={updateForm('notes')}
                                            multiline
                                            rows={3}
                                            sx={{ gridColumn: '1 / -1' }}
                                        />
                                    </FormSection>
                                </Box>
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : (currentItem ? 'Update' : 'Create')}
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
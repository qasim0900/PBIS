import { motion, AnimatePresence } from 'framer-motion';
import TableView from '../../components/template';
import { Add, Close, Edit } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    MenuItem,
} from '@mui/material';

//---------------------------------------
// :: Motion Variants
//---------------------------------------
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const scaleIn = { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', duration: 0.3 } };

//---------------------------------------
// :: BrandDesign Component
//---------------------------------------
export default function BrandDesign({
    brands,
    vendors,
    loading,
    open,
    editing,
    formData,
    setFormData,
    openDialog,
    closeDialog,
    handleSubmit,
}) {
    //---------------------------------------
    // :: Form Update Handler
    //---------------------------------------
    const updateForm = (key) => (e) => setFormData({ ...formData, [key]: e.target?.value ?? e });

    //---------------------------------------
    // :: Table Columns Configuration
    //---------------------------------------
    const columns = [
        { header: 'Name', render: (r) => r.name },
        {
            header: 'Vendor',
            render: (r) => vendors?.find(v => v.id === r.vendor)?.name || '—',
        },
        { header: 'Description', render: (r) => r.description || '—' },
    ];

    //---------------------------------------
    // :: Table Row Actions
    //---------------------------------------
    const actions = (row) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton size="small" color="primary" onClick={() => openDialog(row)}>
                <Edit fontSize="small" />
            </IconButton>
        </motion.div>
    );

    //---------------------------------------
    // :: Component Render
    //---------------------------------------
    return (
        <motion.div {...fadeIn}>
            {/* Brand Table */}
            <TableView
                title="Brands"
                subtitle={`Manage brands (${brands.length})`}
                columns={columns}
                data={brands}
                actions={actions}
                loading={loading}
                searchable
                showRefresh
                onRefresh={() => window.location.reload()}
                extraHeaderActions={
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => openDialog()}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            Add Brand
                        </Button>
                    </motion.div>
                }
            />

            {/* Create/Edit Brand Dialog */}
            <AnimatePresence>
                {open && (
                    <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                        <motion.div {...scaleIn}>
                            <DialogTitle className="flex items-center justify-between">
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                                    {editing ? 'Edit Brand' : 'Add Brand'}
                                </span>
                                <IconButton onClick={closeDialog} size="small">
                                    <Close />
                                </IconButton>
                            </DialogTitle>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                                noValidate
                            >
                                <DialogContent dividers>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 3,   // <-- space between fields, 3 = 24px
                                            pt: 1,
                                        }}
                                    >
                                        {/* Name */}
                                        <TextField
                                            label="Brand Name"
                                            value={formData.name}
                                            onChange={updateForm('name')}
                                            fullWidth
                                            autoFocus
                                        />

                                        {/* Vendor Dropdown */}
                                        <TextField
                                            select
                                            label="Vendor"
                                            value={formData.vendor || ''}
                                            onChange={updateForm('vendor')}
                                            fullWidth
                                        >
                                            {vendors?.map((vendor) => (
                                                <MenuItem key={vendor.id} value={vendor.id}>
                                                    {vendor.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        {/* Description */}
                                        <TextField
                                            label="Description (Optional)"
                                            multiline
                                            rows={3}
                                            value={formData.description || ''}
                                            onChange={updateForm('description')}
                                            fullWidth
                                        />
                                    </Box>
                                </DialogContent>

                                <DialogActions className="p-4">
                                    <Button onClick={closeDialog}>Cancel</Button>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button type="submit" variant="contained">
                                            {editing ? 'Update' : 'Add'}
                                        </Button>
                                    </motion.div>
                                </DialogActions>
                            </form>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
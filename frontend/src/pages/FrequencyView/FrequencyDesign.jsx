import { useState, useEffect } from 'react';
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
} from '@mui/material';

//---------------------------------------
// :: Animations
//---------------------------------------
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const scaleIn = { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', duration: 0.3 } };

//---------------------------------------
// :: FrequencyDesign Function
//---------------------------------------

/*
FrequencyDesign provides a UI for listing, creating, and editing inventory frequencies
with validation and animated dialogs for better UX.
*/

export default function FrequencyDesign({
    frequencies,
    loading,
    open,
    editing,
    formData,
    setFormData,
    openDialog,
    closeDialog,
    handleSubmit,
}) {
    const [errors, setErrors] = useState({});

    //---------------------------------------
    // :: useEffect to clear errors
    //---------------------------------------
    useEffect(() => {
        const clearErrors = () => setErrors({});
        document.addEventListener('click', clearErrors);
        return () => document.removeEventListener('click', clearErrors);
    }, []);

    //---------------------------------------
    // :: validateForm Function
    //---------------------------------------
    const validateForm = () => {
        const newErrors = {};
        if (!formData.frequency_name) newErrors.frequency_name = 'Inventory List Name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //---------------------------------------
    // :: handleFormSubmit Function
    //---------------------------------------
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            frequency_name: formData.frequency_name,
            description: formData.description,
        };

        handleSubmit(payload);
    };

    //---------------------------------------
    // :: columns for TableView
    //---------------------------------------
    const columns = [
        { header: 'Inventory List', render: (row) => row.frequency_name || '—' },
        { header: 'Description', render: (row) => row.description || '—' },
    ];

    //---------------------------------------
    // :: actions for TableView rows
    //---------------------------------------
    const actions = (row) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton size="small" color="primary" onClick={() => openDialog(row)}>
                <Edit fontSize="small" />
            </IconButton>
        </motion.div>
    );

    //---------------------------------------
    // :: Render Component
    //---------------------------------------
    return (
        <motion.div {...fadeIn}>
            <TableView
                title="Count Inventory List"
                subtitle={`Manage count Inventory List (${frequencies.length})`}
                columns={columns}
                data={frequencies}
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
                            sx={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }}
                        >
                            Add Inventory List
                        </Button>
                    </motion.div>
                }
            />

            <AnimatePresence>
                {open && (
                    <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                        <motion.div {...scaleIn}>
                            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #4F46E5, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {editing ? 'Edit Inventory List' : 'Add New Inventory List'}
                                </Box>
                                <IconButton onClick={() => { setErrors({}); closeDialog(); }} size="small">
                                    <Close />
                                </IconButton>
                            </DialogTitle>

                            <form onSubmit={handleFormSubmit} noValidate>
                                <DialogContent dividers>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                                        <TextField
                                            label="Inventory List Name"
                                            value={formData.frequency_name || ''}
                                            onChange={(e) => setFormData({ ...formData, frequency_name: e.target.value })}
                                            fullWidth
                                            error={!!errors.frequency_name}
                                            helperText={errors.frequency_name}
                                        />
                                        <TextField
                                            label="Description"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={3}
                                        />
                                    </Box>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => { setErrors({}); closeDialog(); }}>Cancel</Button>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button type="submit" variant="contained">
                                            {editing ? 'Update' : 'Create'}
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
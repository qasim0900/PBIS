import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TableView from '../../components/template';
import LocationForm from '../../components/forms/LocationForm';
import { Add, LocationOn, Schedule, Code, Close, Edit } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';

//---------------------------------------
// :: Animations
//---------------------------------------
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const scaleIn = { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', duration: 0.3 } };

//---------------------------------------
// :: LocationsDesign Component
//---------------------------------------

export default function LocationsDesign({
    locations,
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
    // :: Clear errors on page click
    //---------------------------------------
    useEffect(() => {
        const clearErrors = () => setErrors({});
        document.addEventListener('click', clearErrors);
        return () => document.removeEventListener('click', clearErrors);
    }, []);

    //---------------------------------------
    // :: Update form field handler
    //---------------------------------------
    const updateForm = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

    //---------------------------------------
    // :: Handle form submission
    //---------------------------------------
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit();
    };

    //---------------------------------------
    // :: Table columns
    //---------------------------------------
    const columns = [
        {
            header: 'Location Name',
            render: (row) => row.name,
        },
        {
            header: 'Description',
            render: (row) => row.description || '-',
        },
        {
            header: 'Status',
            render: (row) =>
                row.is_active ? (
                    <Chip label="Active" color="success" size="small" />
                ) : (
                    <Chip label="Inactive" color="default" size="small" />
                ),
            align: 'center',
        },
    ];

    //---------------------------------------
    // :: Row actions
    //---------------------------------------
    const actions = (row) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton size="small" color="primary" onClick={() => openDialog(row)}>
                <Edit fontSize="small" />
            </IconButton>
        </motion.div>
    );

    //---------------------------------------
    // :: Render component
    //---------------------------------------
    return (
        <motion.div {...fadeIn}>
            <TableView
                title="Locations"
                subtitle={`Manage locations (${locations.length})`}
                columns={columns}
                data={locations}
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
                            sx={{
                                background: 'linear-gradient(to right, #6366F1, #8B5CF6)',
                                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                            }}
                        >
                            Add Location
                        </Button>
                    </motion.div>
                }
            />

            <AnimatePresence>
                {open && (
                    <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                        <motion.div {...scaleIn}>
                            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box
                                    sx={{
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(to right, #4F46E5, #8B5CF6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {editing ? 'Edit Location' : 'Add Location'}
                                </Box>
                                <IconButton onClick={closeDialog} size="small">
                                    <Close />
                                </IconButton>
                            </DialogTitle>

                            <form onSubmit={handleFormSubmit}>
                                <DialogContent dividers>
                                    <LocationForm values={formData} onChange={setFormData} errors={errors} />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={closeDialog}>Cancel</Button>
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
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ChromePicker } from 'react-color';
import TableView from '../../components/template';
import { Add, Close } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    MenuItem,
} from '@mui/material';

//---------------------------------------
// :: VendorDesign Component
//---------------------------------------
export default function VendorDesign({
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
    // :: Redux State (Locations)
    //---------------------------------------
    const { locations } = useSelector((state) => state.locations);

    //---------------------------------------
    // :: Local UI State
    //---------------------------------------
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [errors, setErrors] = useState({}); // Validation errors

    //---------------------------------------
    // :: Form Update Handler
    //---------------------------------------
    const updateForm = (key) => (e) =>
        setFormData({ ...formData, [key]: e.target?.value ?? e });

    //---------------------------------------
    // :: Form Validation
    //---------------------------------------
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Vendor Name is required';
        if (!formData.contact_person)
            newErrors.contact_person = 'Contact Person is required';
        if (!formData.location)
            newErrors.location = 'Please select at least one location';
        if (!formData.color) newErrors.color = 'Vendor Color is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //---------------------------------------
    // :: Handle Form Submit
    //---------------------------------------
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) handleSubmit(e);
    };

    useEffect(() => {
        const handleClick = () => setErrors({});
        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);
    //---------------------------------------
    // :: Table Columns Configuration
    //---------------------------------------
    const columns = [
        {
            header: 'Vendor',
            render: ({ name, color }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {name?.[0]?.toUpperCase()}
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>{name}</Box>
                </Box>
            ),
        },
        { header: 'Contact Person', render: (r) => r.contact_person || '—' },
        {
            header: 'Location',
            render: (r) =>
                r.location_names?.length ? r.location_names.join(', ') : '—',
        },
        {
            header: 'Phone',
            align: 'center',
            render: (r) => (r.phone ? <Chip label={r.phone} size="small" /> : '—'),
        },
        {
            header: 'Email',
            render: (r) => (r.email ? <Chip label={r.email} size="small" /> : '—'),
        },
        {
            header: 'Notes',
            render: (r) => (r.notes ? <Chip label={r.notes} size="small" /> : '—'),
        },
    ];

    //---------------------------------------
    // :: Table Row Actions
    //---------------------------------------
    const actions = (row) => (
        <Button size="small" variant="outlined" onClick={() => openDialog(row)}>
            Edit
        </Button>
    );

    //---------------------------------------
    // :: Component Render
    //---------------------------------------
    return (
        <>
            {/* Vendor Table */}
            <TableView
                title="Vendors"
                subtitle={`Manage vendors (${vendors.length})`}
                columns={columns}
                data={vendors}
                actions={actions}
                loading={loading}
                searchable
                showRefresh
                onRefresh={() => window.location.reload()}
                extraHeaderActions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => openDialog()}
                    >
                        Add Vendor
                    </Button>
                }
            />

            {/* Create/Edit Vendor Dialog */}
            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Vendor' : 'Add Vendor'}
                    <IconButton
                        onClick={closeDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleFormSubmit} noValidate>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            {/* Location Selector */}
                            <TextField
                                select
                                label="Location *"
                                value={formData.location || 0}
                                onChange={updateForm('location')}
                                SelectProps={{
                                    multiple: false,
                                    MenuProps: {
                                        disableAutoFocusItem: true,
                                    },
                                }}
                                fullWidth
                                error={!!errors.location}
                                helperText={errors.location}
                            >
                                {locations.map(({ id, name }) => (
                                    <MenuItem key={id} value={id}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Vendor Name */}
                            <TextField
                                label="Vendor Name *"
                                value={formData.name}
                                onChange={updateForm('name')}
                                fullWidth
                                autoFocus
                                error={!!errors.name}
                                helperText={errors.name}
                            />

                            {/* Contact Person */}
                            <TextField
                                label="Contact Person *"
                                value={formData.contact_person}
                                onChange={updateForm('contact_person')}
                                fullWidth
                                error={!!errors.contact_person}
                                helperText={errors.contact_person}
                            />

                            {/* Phone */}
                            <TextField
                                label="Phone"
                                value={formData.phone}
                                onChange={updateForm('phone')}
                                fullWidth
                                error={!!errors.phone}
                                helperText={errors.phone}
                            />

                            {/* Email */}
                            <TextField
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={updateForm('email')}
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email}
                            />

                            {/* Notes */}
                            <TextField
                                label="Notes"
                                multiline
                                rows={3}
                                value={formData.notes}
                                onChange={updateForm('notes')}
                                fullWidth
                                error={!!errors.notes}
                                helperText={errors.notes}
                            />

                            {/* Vendor Color */}
                            <TextField
                                label="Vendor Color *"
                                value={formData.color}
                                onClick={() => setShowColorPicker(true)}
                                fullWidth
                                InputProps={{
                                    readOnly: true,
                                    startAdornment: (
                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                bgcolor: formData.color,
                                                borderRadius: 1,
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                }}
                                error={!!errors.color}
                                helperText={errors.color}
                            />
                            {showColorPicker && (
                                <Box sx={{ position: 'absolute', zIndex: 10 }}>
                                    <Box
                                        sx={{ position: 'fixed', inset: 0 }}
                                        onClick={() => setShowColorPicker(false)}
                                    />
                                    <ChromePicker
                                        color={formData.color}
                                        onChange={(c) =>
                                            setFormData({ ...formData, color: c.hex })
                                        }
                                    />
                                </Box>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {editing ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

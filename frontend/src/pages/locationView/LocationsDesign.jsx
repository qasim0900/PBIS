import { useState, useEffect } from 'react';
import TableView from '../../components/template';
import LocationForm from '../../components/forms/LocationForm';
import { Add, LocationOn, Schedule, Code, Close } from '@mui/icons-material';
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
    frequencies,
}) {
    //---------------------------------------
    // :: Local UI State (Validation Errors)
    //---------------------------------------
    const [errors, setErrors] = useState({});

    //---------------------------------------
    // :: Global Click Handler to Clear Errors
    //---------------------------------------
    useEffect(() => {
        const handleClick = () => setErrors({});
        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    //---------------------------------------
    // :: Helper Functions
    //---------------------------------------
    const getFrequencyLabel = (id) =>
        frequencies?.find((f) => f.id === id)?.days_range || '—';

    const updateForm = (key) => (e) =>
        setFormData({ ...formData, [key]: e.target?.value ?? e });

    //---------------------------------------
    // :: Form Validation (Only Frequency Required)
    //---------------------------------------
    const validateForm = () => {
        const newErrors = {};

        if (!formData.frequency) newErrors.frequency = 'Frequency is required';

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

    //---------------------------------------
    // :: Table Columns Configuration
    //---------------------------------------
    const columns = [
        {
            header: 'Location',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <LocationOn sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>{row.name}</Box>
                </Box>
            ),
        },
        {
            header: 'Code',
            render: (row) => (
                <Chip
                    icon={<Code fontSize="small" />}
                    label={row.code}
                    size="small"
                    variant="outlined"
                />
            ),
            align: 'center',
        },
        {
            header: 'Timezone',
            render: (row) => (
                <Chip
                    icon={<Schedule fontSize="small" />}
                    label={row.timezone}
                    size="small"
                    color="info"
                    variant="filled"
                />
            ),
            align: 'center',
        },
        {
            header: 'Frequency',
            render: (row) => (
                <Chip
                    label={getFrequencyLabel(row.frequency)}
                    size="small"
                    color="secondary"
                    variant="outlined"
                />
            ),
            align: 'center',
        },
    ];

    //---------------------------------------
    // :: Row Actions
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
            {/* Locations Table */}
            <TableView
                title="Locations"
                subtitle={`Manage locations (${locations.length})`}
                columns={columns}
                data={locations}
                actions={actions}
                extraHeaderActions={
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
                        Add Location
                    </Button>
                }
                loading={loading}
                searchable
                showRefresh
                onRefresh={() => window.location.reload()}
            />

            {/* Add / Edit Location Dialog */}
            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Location' : 'Add Location'}
                    <IconButton
                        onClick={() => {
                            setErrors({});
                            closeDialog();
                        }}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleFormSubmit} noValidate>
                    <DialogContent dividers>
                        {/* Frequency Selector */}
                        <TextField
                            select
                            label="Frequency *"
                            value={formData.frequency || ''}
                            onChange={updateForm('frequency')}
                            fullWidth
                            margin="normal"
                            error={!!errors.frequency}
                            helperText={errors.frequency}
                        >
                            <MenuItem value="">— Select Frequency —</MenuItem>
                            {frequencies?.map((f) => (
                                <MenuItem key={f.id} value={f.id}>
                                    {f.days_range}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Other Location Fields (Optional) */}
                        <LocationForm
                            values={formData}
                            onChange={setFormData}
                            errors={errors} // Can still pass errors for future fields
                        />
                    </DialogContent>

                    {/* Dialog Actions */}
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setErrors({}); // Clear all errors
                                closeDialog(); // Close dialog
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            {editing ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

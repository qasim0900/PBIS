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
// :: Locations Design Function
//---------------------------------------


/*
A presentational component that renders the Locations table and a dialog form for creating or editing a location.
*/

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
    const [errors, setErrors] = useState({});


    //---------------------------------------
    // :: useEffect Clean Function
    //---------------------------------------


    /*
    This `useEffect` clears form errors whenever the user clicks anywhere on the page.
    */

    useEffect(() => {
        const clear = () => setErrors({});
        document.addEventListener('click', clear);
        return () => document.removeEventListener('click', clear);
    }, []);


    //---------------------------------------
    // :: update Form Function
    //---------------------------------------


    /*
    This function returns an event handler that updates a specific form field in `formData` using the given key.
    */

    const updateForm = (key) => (e) =>
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));


    //---------------------------------------
    // :: validate Form Function
    //---------------------------------------


    /*
    This function checks if the **frequency field is filled**, sets an error message if not, and returns `true` only if the form has **no errors**.
    */

    const validateForm = () => {
        const err = {};
        if (!formData.frequency) err.frequency = 'Inventory List is required';
        setErrors(err);
        return !Object.keys(err).length;
    };


    //---------------------------------------
    // :: handle Form Submit Function
    //---------------------------------------


    /*
    This function **prevents the default form submission**, validates the form, and only calls `handleSubmit()` if the validation passes.
    */

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) handleSubmit();
    };


    //---------------------------------------
    // :: columns List
    //---------------------------------------


    /*
    Defines table columns for Locations with custom renderers showing name, code, and timezone in styled UI components.
    */

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
                        <LocationOn sx={{ color: '#fff' }} />
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>{row.name}</Box>
                </Box>
            ),
        },
        {
            header: 'Code',
            render: (row) => (
                <Chip icon={<Code fontSize="small" />} label={row.code} size="small" />
            ),
            align: 'center',
        },
        {
            header: 'Timezone',
            render: (row) => (
                <Chip icon={<Schedule fontSize="small" />} label={row.timezone} size="small" />
            ),
            align: 'center',
        },
    ];


    //---------------------------------------
    // :: actions Function
    //---------------------------------------


    /*
    Creates an "Edit" button for each row that opens the dialog pre-filled with the selected location's data.
    */

    const actions = (row) => (
        <Button
            size="small"
            variant="outlined"
            onClick={() =>
                openDialog({
                    ...row,
                    frequency: row.frequency,
                })
            }
        >
            Edit
        </Button>
    );


    //---------------------------------------
    // :: Return Code
    //---------------------------------------


    /*
    Displays a locations table with add/edit functionality using a dialog form.
    */

    return (
        <>
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
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
                        Add Location
                    </Button>
                }
            />

            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Location' : 'Add Location'}
                    <IconButton
                        onClick={closeDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleFormSubmit}>
                    <DialogContent dividers>
                        <Box mb={2}>
                            <TextField
                                select
                                fullWidth
                                label="Inventory List *"
                                value={formData.frequency || ''}
                                onChange={updateForm('frequency')}
                                error={!!errors.frequency}
                                helperText={errors.frequency}
                            >
                                <MenuItem value="">— Select Inventory List —</MenuItem>
                                {frequencies?.map((f) => (
                                    <MenuItem key={f.id} value={f.id}>
                                        {f.frequency_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <LocationForm
                            values={formData}
                            onChange={setFormData}
                            errors={errors}
                        />
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

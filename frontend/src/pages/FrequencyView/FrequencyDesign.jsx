import { useState, useEffect } from 'react';
import TableView from '../../components/template';
import { Add, Close } from '@mui/icons-material';
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
// :: FrequencyDesign function
//---------------------------------------

/*
FrequencyDesign provides a UI for listing, creating, and editing count 
frequencies with validation for recurrence or day range selection
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
    const isRecurrenceSelected = false;
    const isDayRangeSelected = false;


    //---------------------------------------
    // :: useEffect Dispatch Function
    //---------------------------------------

    /*
    This useEffect clears form errors whenever the user clicks anywhere on the page.
    */

    useEffect(() => {
        const clearErrors = () => setErrors({});
        document.addEventListener('click', clearErrors);
        return () => document.removeEventListener('click', clearErrors);
    }, []);


    //---------------------------------------
    // :: validateForm Function
    //---------------------------------------

    /*
    This function validates the frequency form by ensuring Times Run is filled, and that the user
     selects either a recurrence type or a valid start/end day range 
    (but not both), then stores any errors for display.
    */

    const validateForm = () => {
        const newErrors = {};

        if (!formData.frequency_name) {
            newErrors.frequency_name = 'Inventory List Name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    //---------------------------------------
    // :: handleFormSubmit Function
    //---------------------------------------

    /*
    This function handles the form submission by preventing default behaviour, 
    validating the input, preparing a payload (either with start/end days or recurrence type), 
    and then calling `handleSubmit` to save the frequency.
    */

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
    // :: columns List
    //---------------------------------------

    /*
    This `columns` array defines the table structure, mapping each frequency field to a column
    header and formatting the displayed values (including converting day codes to labels).
    */

    const columns = [
        { header: 'Inventory List', render: row => row.frequency_name || '—' },
        { header: 'Description', render: row => row.description || '—' },
    ];

    //---------------------------------------
    // :: actions Function
    //---------------------------------------

    /*
    This `actions` function renders an **Edit** button for each table row, opening the dialog pre-filled with that row’s data.
    */

    const actions = (row) => (
        <Button size="small" variant="outlined" onClick={() => openDialog(row)}>
            Edit
        </Button>
    );


    //---------------------------------------
    // :: Return Code
    //---------------------------------------

    /*
    A table-based interface to manage count frequencies, with add/edit dialog functionality and validation.
    */

    return (
        <>
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
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
                        Add Inventory List
                    </Button>
                }
            />

            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Inventory List' : 'Add New Inventory List'}
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>

                            <TextField
                                label="Inventory List Name"
                                value={formData.frequency_name || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, frequency_name: e.target.value })
                                }
                                fullWidth
                                required
                                error={!!errors.frequency_name}
                                helperText={errors.frequency_name}
                            />

                            <TextField
                                label="Description"
                                value={formData.description || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                fullWidth
                                multiline
                                rows={3}
                            />

                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() => {
                                setErrors({});
                                closeDialog();
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
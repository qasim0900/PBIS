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
// :: WEEKDAYS List
//---------------------------------------
/*
WEEKDAYS defines the selectable days of the week with corresponding labels for use in forms and dropdowns.
*/

const WEEKDAYS = [
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' },
];


//---------------------------------------
// :: RECURRENCE_TYPES List
//---------------------------------------

/*
RECURRENCE_TYPES defines the available recurrence options with labels for use in scheduling and frequency selection.
*/

const RECURRENCE_TYPES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];


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
    const isRecurrenceSelected = !!formData.recurrence_type;
    const isDayRangeSelected = !!formData.start_day || !!formData.end_day;


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
    // :: getEndDayOptions Function
    //---------------------------------------

    /*
    This function returns the list of valid end-day options based on the selected start day, 
    ensuring the end day always comes after the start day.
    */

    const getEndDayOptions = () => {
        if (!formData.start_day) return WEEKDAYS;
        const startIndex = WEEKDAYS.findIndex(d => d.value === formData.start_day);
        return WEEKDAYS.slice(startIndex + 1);
    };


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

        if (!formData.times_run) newErrors.times_run = 'Times run is required';

        if (formData.start_day && !formData.end_day) newErrors.end_day = 'End day is required';
        if (formData.end_day && !formData.start_day) newErrors.start_day = 'Start day is required';

        if (!formData.recurrence_type && (!formData.start_day || !formData.end_day)) {
            newErrors.general = 'Must select either Recurrence Type or both Start/End Days';
        }

        if (formData.recurrence_type && (formData.start_day || formData.end_day)) {
            newErrors.general = 'Cannot select both Recurrence Type and Days';
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

        const payload = { times_run: formData.times_run };

        if (formData.start_day && formData.end_day) {
            payload.start_day = formData.start_day;
            payload.end_day = formData.end_day;
            payload.recurrence_type = null;
        } else {
            payload.recurrence_type = formData.recurrence_type;
            payload.start_day = null;
            payload.end_day = null;
        }

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
        { header: 'Frequency Type', render: row => row.common_frequency || row.common_frequency || '—' },
        { header: 'Recurrence Type', render: row => row.recurrence_display || row.recurrence_type || '—' },
        { header: 'Start Day', render: row => WEEKDAYS.find(d => d.value === row.start_day)?.label || '—' },
        { header: 'End Day', render: row => WEEKDAYS.find(d => d.value === row.end_day)?.label || '—' },
        { header: 'Times Run', render: row => row.times_run || '—' },
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
                title="Count Frequencies"
                subtitle={`Manage count frequencies (${frequencies.length})`}
                columns={columns}
                data={frequencies}
                actions={actions}
                loading={loading}
                searchable
                showRefresh
                onRefresh={() => window.location.reload()}
                extraHeaderActions={
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
                        Add Frequency
                    </Button>
                }
            />

            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Frequency' : 'Add New Frequency'}
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
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {['start_day', 'end_day'].map((field) => (
                                    <TextField
                                        key={field}
                                        select
                                        label={field === 'start_day' ? 'Start Day' : 'End Day'}
                                        value={formData[field] || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            [field]: e.target.value,
                                            recurrence_type: ''
                                        })}
                                        fullWidth
                                        disabled={isRecurrenceSelected}
                                        error={!!errors[field]}
                                        helperText={errors[field]}
                                    >
                                        <MenuItem value="">— None —</MenuItem>

                                        {field === 'end_day'
                                            ? getEndDayOptions().map(day => (
                                                <MenuItem key={day.value} value={day.value}>
                                                    {day.label}
                                                </MenuItem>
                                            ))
                                            : WEEKDAYS.map(day => (
                                                <MenuItem key={day.value} value={day.value}>
                                                    {day.label}
                                                </MenuItem>
                                            ))
                                        }
                                    </TextField>
                                ))}
                            </Box>

                            <TextField
                                select
                                label="Recurrence Type"
                                value={formData.recurrence_type || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        recurrence_type: e.target.value,
                                        start_day: '',
                                        end_day: '',
                                    })
                                }
                                fullWidth
                                disabled={isDayRangeSelected}
                                error={!!errors.recurrence_type}
                                helperText={errors.recurrence_type}
                            >
                                <MenuItem value="">— None —</MenuItem>
                                {RECURRENCE_TYPES.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Times Run"
                                type="number"
                                value={formData.times_run || ''}
                                onChange={(e) => setFormData({ ...formData, times_run: e.target.value })}
                                fullWidth
                                error={!!errors.times_run}
                                helperText={errors.times_run}
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

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
// :: Constants
//---------------------------------------
const WEEKDAYS = [
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' },
];

const RECURRENCE_TYPES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

//---------------------------------------
// :: Component
//---------------------------------------
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
    //---------------------------------------
    // :: Local State
    //---------------------------------------
    const [errors, setErrors] = useState({});

    //---------------------------------------
    // :: Clear errors on outside click
    //---------------------------------------
    useEffect(() => {
        const clearErrors = () => setErrors({});
        document.addEventListener('click', clearErrors);
        return () => document.removeEventListener('click', clearErrors);
    }, []);

    //---------------------------------------
    // :: Derived State
    //---------------------------------------
    const isRecurrenceSelected = !!formData.recurrence_type;
    const isDayRangeSelected = !!formData.start_day || !!formData.end_day;

    //---------------------------------------
    // :: Validation
    //---------------------------------------
    const validateForm = () => {
        const newErrors = {};

        // Either recurrence OR start+end days
        if (!isRecurrenceSelected) {
            if (!formData.start_day) newErrors.start_day = 'Start day is required';
            if (!formData.end_day) newErrors.end_day = 'End day is required';
        }

        if (!isDayRangeSelected && !formData.recurrence_type) {
            newErrors.recurrence_type = 'Recurrence type is required';
        }

        if (!formData.times_run) {
            newErrors.times_run = 'Times run is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //---------------------------------------
    // :: Submit
    //---------------------------------------
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) handleSubmit(e);
    };

    //---------------------------------------
    // :: Table Columns
    //---------------------------------------
    const columns = [
        { header: 'Recurrence Type', render: row => row.recurrence_display || row.recurrence_type || '—' },
        { header: 'Start Day', render: row => WEEKDAYS.find(d => d.value === row.start_day)?.label || '—' },
        { header: 'End Day', render: row => WEEKDAYS.find(d => d.value === row.end_day)?.label || '—' },
        { header: 'Days Range', render: row => row.days_range || '—' },
        { header: 'Times Run', render: row => row.times_run || '—' },
        { header: 'Runs/Week', render: row => row.runs_per_week || '—' },
        { header: 'Runs/Month', render: row => row.runs_per_month || '—' },
        { header: 'Runs/Year', render: row => row.runs_per_year || '—' },
    ];

    //---------------------------------------
    // :: Actions
    //---------------------------------------
    const actions = (row) => (
        <Button size="small" variant="outlined" onClick={() => openDialog(row)}>
            Edit
        </Button>
    );

    //---------------------------------------
    // :: Render
    //---------------------------------------
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
                            {/* Start / End Day */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {['start_day', 'end_day'].map((field) => (
                                    <TextField
                                        key={field}
                                        select
                                        label={field === 'start_day' ? 'Start Day' : 'End Day'}
                                        value={formData[field] || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [field]: e.target.value })
                                        }
                                        fullWidth
                                        disabled={isRecurrenceSelected}
                                        error={!!errors[field]}
                                        helperText={errors[field]}
                                    >
                                        <MenuItem value="">— None —</MenuItem>
                                        {WEEKDAYS.map(day => (
                                            <MenuItem key={day.value} value={day.value}>
                                                {day.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ))}
                            </Box>

                            {/* Recurrence */}
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

                            {/* Times Run */}
                            <TextField
                                label="Times Run"
                                type="number"
                                value={formData.times_run || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, times_run: e.target.value })
                                }
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

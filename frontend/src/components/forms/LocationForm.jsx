import { memo, useCallback } from 'react';
import { Box, TextField, MenuItem } from '@mui/material';


//-----------------------------------
// :: Time Zones Function
//-----------------------------------

/*
This defines a **list of timezone options** with their identifiers and display labels for selection in a form.
*/

const TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern (ET)' },
    { value: 'America/Chicago', label: 'Central (CT)' },
    { value: 'America/Denver', label: 'Mountain (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
];


//-----------------------------------
// :: Location Form Function
//-----------------------------------

/*
This `LocationForm` component is a **controlled form for creating or editing a location**, handling name, uppercase code,
and timezone selection while updating parent state via `onChange`.
*/

const LocationForm = ({ values, onChange, errors = {} }) => {

    //-----------------------------------
    // :: Handle Change Function
    //-----------------------------------

    /*
    This defines a **memoized `handleChange` function** that returns an event handler for a 
    given field, updating the parent state and converting the `code` field to uppercase.
    */

    const handleChange = useCallback(
        (key) => (e) => {
            const value = key === 'code' ? e.target.value.toUpperCase() : e.target.value;
            onChange({ ...values, [key]: value });
        },
        [values, onChange]
    );


    //-----------------------------------
    // :: Return Code
    //-----------------------------------

    /*
    This JSX **renders a controlled form for a location** with fields for name, uppercase code, 
    and timezone selection, all updating parent state via `handleChange`.
    */

    return (
        <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
                label="Location Name"
                value={values.name}
                onChange={handleChange('name')}
                required
                fullWidth
                autoFocus
                placeholder="e.g., Syracuse Store"
                error={!!errors.name}
                helperText={errors.name || 'Enter a unique name for this location (2-255 characters)'}
            />

            <TextField
                label="Location Code"
                value={values.code}
                onChange={handleChange('code')}
                required
                fullWidth
                inputProps={{ maxLength: 32 }}
                placeholder="e.g., SYR"
                error={!!errors.code}
                helperText={errors.code || 'Short unique code (2-32 characters, uppercase letters, numbers, hyphens, underscores)'}
            />

            <TextField
                select
                label="Timezone"
                value={values.timezone}
                onChange={handleChange('timezone')}
                fullWidth
                error={!!errors.timezone}
                helperText={errors.timezone || 'Select the timezone for this location'}
            >
                {TIMEZONES.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
};


//-----------------------------------
// :: Default Form Function
//-----------------------------------

/*
This line exports `LocationForm` wrapped with `React.memo`, 
making it a memoized component that only re-renders when its props change.
*/

export default memo(LocationForm);

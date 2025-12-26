import { memo } from 'react';
import {
    Box,
    TextField,
    MenuItem,
} from '@mui/material';

const TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern (ET)' },
    { value: 'America/Chicago', label: 'Central (CT)' },
    { value: 'America/Denver', label: 'Mountain (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
];

const LocationForm = ({ values, onChange }) => {
    const handleChange = (key) => (e) => {
        const value =
            key === 'code'
                ? e.target.value.toUpperCase()
                : e.target.value;

        onChange({ ...values, [key]: value });
    };

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
            />

            <TextField
                label="Location Code"
                value={values.code}
                onChange={handleChange('code')}
                required
                fullWidth
                inputProps={{ maxLength: 10 }}
                placeholder="e.g., SYR"
            />

            <TextField
                select
                label="Timezone"
                value={values.timezone}
                onChange={handleChange('timezone')}
                fullWidth
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

export default memo(LocationForm);

import { memo, useCallback } from 'react';
import { Box, TextField, MenuItem } from '@mui/material';

const LocationForm = ({ values, onChange, errors = {} }) => {

    //-----------------------------------
    // :: Handle Change
    //-----------------------------------

    const handleChange = useCallback(
        (key) => (e) => {
            const value =
                key === 'is_active'
                    ? e.target.value === 'true' || e.target.value === true
                    : e.target.value;

            onChange({ ...values, [key]: value });
        },
        [values, onChange]
    );

    //-----------------------------------
    // :: Render
    //-----------------------------------

    return (
        <Box display="flex" flexDirection="column" gap={2.5}>

            <TextField
                label="Location Name"
                value={values.name || ''}
                onChange={handleChange('name')}
                required
                fullWidth
                autoFocus
                placeholder="e.g., Warehouse"
                error={!!errors.name}
                helperText={
                    errors.name ||
                    'Enter a unique name for this location (2-255 characters)'
                }
            />

            <TextField
                label="Description"
                value={values.description || ''}
                onChange={handleChange('description')}
                fullWidth
                multiline
                rows={3}
                placeholder="Optional description"
                error={!!errors.description}
                helperText={errors.description || 'Optional description'}
            />
        </Box>
    );
};

export default memo(LocationForm);

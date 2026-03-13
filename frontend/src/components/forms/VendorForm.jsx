import { memo, useCallback } from 'react';
import { Box, TextField } from '@mui/material';

const VendorForm = ({ values, onChange, errors = {} }) => {

    //-----------------------------------
    // :: Handle Change
    //-----------------------------------

    const handleChange = useCallback(
        (key) => (e) => {
            onChange({ ...values, [key]: e.target.value });
        },
        [values, onChange]
    );

    //-----------------------------------
    // :: Render
    //-----------------------------------

    return (
        <Box display="flex" flexDirection="column" gap={2.5}>

            <TextField
                label="Vendor Name"
                value={values.name || ''}
                onChange={handleChange('name')}
                required
                fullWidth
                autoFocus
                placeholder="e.g., ABC Supplies"
                error={!!errors.name}
                helperText={
                    errors.name ||
                    'Enter a unique vendor name (1-255 characters)'
                }
            />

            <TextField
                label="Display Color"
                value={values.color || '#6B5B95'}
                onChange={handleChange('color')}
                fullWidth
                placeholder="#6B5B95"
                error={!!errors.color}
                helperText={
                    errors.color ||
                    'Hex color for reports (e.g., #6B5B95)'
                }
            />

            <TextField
                label="Contact Person"
                value={values.contact_person || ''}
                onChange={handleChange('contact_person')}
                fullWidth
                placeholder="e.g., John Smith"
                error={!!errors.contact_person}
                helperText={errors.contact_person || 'Optional contact person name'}
            />

            <TextField
                label="Phone"
                value={values.phone || ''}
                onChange={handleChange('phone')}
                fullWidth
                placeholder="e.g., +1-555-123-4567"
                error={!!errors.phone}
                helperText={errors.phone || 'Optional phone number'}
            />

            <TextField
                label="Email"
                value={values.email || ''}
                onChange={handleChange('email')}
                fullWidth
                type="email"
                placeholder="e.g., contact@vendor.com"
                error={!!errors.email}
                helperText={errors.email || 'Optional email address'}
            />

            <TextField
                label="Notes"
                value={values.notes || ''}
                onChange={handleChange('notes')}
                fullWidth
                multiline
                rows={4}
                placeholder="Additional notes about this vendor"
                error={!!errors.notes}
                helperText={errors.notes || 'Optional notes'}
            />

        </Box>
    );
};

export default memo(VendorForm);

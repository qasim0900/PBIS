import { memo } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';

const FREQUENCIES = [
  { label: "Mon/Wed", value: "mon_wed" },
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "bi_weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Semi-Annual", value: "semi_annual" },
  { label: "Annual", value: "annual" },
];

const OverrideForm = ({
    values,
    locations,
    catalogItems,
    onChange,
}) => {
    const handleChange = (key) => (e) => {
        const value =
            e.target.type === 'number'
                ? Number(e.target.value)
                : e.target.value;

        onChange({ ...values, [key]: value });
    };

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                    label="Location"
                    value={values.location_id}
                    onChange={handleChange('location_id')}
                >
                    {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>
                            {loc.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth required>
                <InputLabel>Catalog Item</InputLabel>
                <Select
                    label="Catalog Item"
                    value={values.catalog_item}
                    onChange={handleChange('catalog_item')}
                >
                    {catalogItems.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Vendor (Optional)"
                value={values.vendor_name}
                onChange={handleChange('vendor_name')}
                fullWidth
            />

            <TextField
                label="Par Level"
                type="number"
                value={values.par_level}
                onChange={handleChange('par_level')}
                inputProps={{ min: 0 }}
                required
            />

            <TextField
                label="Order Point"
                type="number"
                value={values.order_point}
                onChange={handleChange('order_point')}
                inputProps={{ min: 0 }}
                required
            />

            <TextField
                label="Count"
                type="number"
                value={values.count}
                onChange={handleChange('count')}
                inputProps={{ min: 1 }}
                required
            />

            <FormControl fullWidth>
                <InputLabel>Count Frequency</InputLabel>
                <Select
                    label="Count Frequency"
                    value={values.count_frequency}
                    onChange={handleChange('count_frequency')}
                >
                    {FREQUENCIES.map((f) => (
                        <MenuItem key={f.value} value={f.value}>
                            {f.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Storage Location"
                value={values.storage_location}
                onChange={handleChange('storage_location')}
                fullWidth
            />

            <TextField
                label="Minimum Order Qty"
                type="number"
                value={values.min_order_qty}
                onChange={handleChange('min_order_qty')}
                inputProps={{ min: 1 }}
                required
            />
        </Box>
    );
};

export default memo(OverrideForm);

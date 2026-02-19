import { memo, useCallback } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';


//-----------------------------------
// :: Frequencies List
//-----------------------------------

/*
This defines a **list of frequency options** with labels and values for use in a dropdown selector.
*/

const FREQUENCIES = [
    { label: "Mon/Wed", value: "mon_wed" },
    { label: "Weekly", value: "weekly" },
    { label: "Bi-Weekly", value: "bi_weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Semi-Annual", value: "semi_annual" },
    { label: "Annual", value: "annual" },
];


//-----------------------------------
// :: Over ride Form Function
//-----------------------------------

/*
`OverrideForm` is a controlled form for managing item overrides with fields for location, catalog item, vendor,
 count frequency, par level, order point, and storage location, updating parent state via memoized handlers.
*/

const OverrideForm = ({ values, locations, catalogItems, vendors, onChange }) => {

    //-----------------------------------
    // :: Handle Change Function
    //-----------------------------------

    /*
    This defines a **memoized handler that updates a field in `values`, converting number inputs to 
    `Number` and calling `onChange`**.
    */

    const handleChange = useCallback(
        (key) => (e) => {
            const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
            onChange({ ...values, [key]: value });
        },
        [values, onChange]
    );


    //-----------------------------------
    // :: Handle Vendor Change Function
    //-----------------------------------

    /*
    This defines a **memoized handler that updates the `vendor` field in 
    `values`, setting it to `null` if no value is selected, and calls `onChange`**.
    */

    const handleVendorChange = useCallback(
        (e) => onChange({ ...values, vendor: e.target.value || null }),
        [values, onChange]
    );


    //-----------------------------------
    // :: Return Code
    //-----------------------------------

    /*
    This JSX renders a **compact controlled form** with fields for location, catalog item, vendor, 
    frequency, par/order levels, and storage, all updating parent state via handlers.
    */

    return (
        <Box display="flex" flexDirection="column" gap={3}>

            <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                    label="Location"
                    value={values.location_id ?? ''}
                    onChange={handleChange('location_id')}
                >
                    {locations.map(({ id, name }) => (
                        <MenuItem key={id} value={id}>{name}</MenuItem>
                    ))}
                </Select>
            </FormControl>


            <FormControl fullWidth required>
                <InputLabel>Catalog Item</InputLabel>
                <Select
                    label="Catalog Item"
                    value={values.catalog_item ?? ''}
                    onChange={handleChange('catalog_item')}
                >
                    {catalogItems.map(({ id, name }) => (
                        <MenuItem key={id} value={id}>{name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Par Level"
                type="number"
                value={values.par_level}
                onChange={handleChange('par_level')}
                inputProps={{ min: 0 }}
                required
                fullWidth
            />
            <TextField
                label="Order Point"
                type="number"
                value={values.order_point}
                onChange={handleChange('order_point')}
                inputProps={{ min: 0 }}
                required
                fullWidth
            />


            <FormControl fullWidth>
                <InputLabel>Count Inventory List</InputLabel>
                <Select
                    label="Count Inventory List"
                    value={values.count_frequency ?? 'weekly'}
                    onChange={handleChange('count_frequency')}
                >
                    {FREQUENCIES.map(({ value, label }) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel>Vendor</InputLabel>
                <Select
                    label="Vendor"
                    value={values.vendor ?? ''}
                    onChange={handleVendorChange}
                >
                    <MenuItem value={null}>None</MenuItem>
                    {vendors.map(({ id, name }) => (
                        <MenuItem key={id} value={id}>{name}</MenuItem>
                    ))}
                </Select>
            </FormControl>


            <TextField
                label="Storage Location"
                value={values.storage_location}
                onChange={handleChange('storage_location')}
                fullWidth
            />
        </Box>
    );
};

//-----------------------------------
// :: Default memo Over Ride Form
//-----------------------------------

/*
This line **exports `OverrideForm` wrapped in `React.memo`**, making it a 
memoized component that only re-renders when its props change.
*/

export default memo(OverrideForm);

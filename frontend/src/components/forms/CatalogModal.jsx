import { useState, useEffect, useCallback } from "react";
import { Close } from "@mui/icons-material";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button,
    Switch,
    FormControlLabel,
    Box,
} from "@mui/material";


//-----------------------------------
// :: exports the configured Axios
//-----------------------------------

/*
This defines a **list of available units for counting or ordering items in the form.
*/

const UNITS = [
    "bags", "cans", "boxes", "pcs", "kg", "liters",
    "cases", "packs", "cartons", "tubs", "bottles", "each",
];


//-----------------------------------
// :: Default Form Function
//-----------------------------------

/*
This defines the **default values for a new item form**, including name, category, units, pack size, and active status.
*/

const DEFAULT_FORM = {
    name: "",
    category: "fruit",
    count_unit: "bags",
    order_unit: "cases",
    pack_size: 1,
    is_active: true,
};


//-----------------------------------
// :: Catalog Modal Function
//-----------------------------------

/*
`CatalogModal` is a reusable Material-UI modal form for adding or editing items with controlled state, dynamic fields, 
validation, and save/cancel actions.
*/

export default function CatalogModal({ open, onClose, onSave, item, categories, saving }) {
    const [formData, setFormData] = useState(DEFAULT_FORM);



    //-----------------------------------
    // :: use Effect Function
    //-----------------------------------

    /*
    This useEffect initializes or resets formData whenever item changes, populating 
    fields from item if it exists or using default values otherwise.
    */

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || "",
                category: item.category || DEFAULT_FORM.category,
                count_unit: item.count_unit || DEFAULT_FORM.count_unit,
                order_unit: item.order_unit || DEFAULT_FORM.order_unit,
                pack_size: item.pack_size || 1,
                is_active: item.is_active ?? true,
            });
        } else {
            setFormData(DEFAULT_FORM);
        }
    }, [item]);


    //-----------------------------------
    // :: Handle Change Function
    //-----------------------------------

    /*
    This line **defines a memoized `handleChange` function** that updates a specific field in `formData` 
    while keeping the rest of the data unchanged.
    */

    const handleChange = useCallback((key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);


    //-----------------------------------
    // :: Handle Save Function
    //-----------------------------------

    /*
    This line defines a memoized handleSave function that calls onSave with the current 
    formData, updating only when formData or onSave changes.
    */

    const handleSave = useCallback(() => onSave(formData), [formData, onSave]);


    //-----------------------------------
    // :: Return Code
    //-----------------------------------

    /*
    This code renders a reusable Material-UI modal form for adding or editing an item with controlled fields, 
    dynamic title, validation, and save/cancel actions.
    */

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {item ? "Edit Item" : "Add New Item"}
                <Button onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
                    <TextField
                        label="Item Name *"
                        value={formData.name}
                        onChange={e => handleChange("name", e.target.value)}
                        fullWidth
                        autoFocus
                    />

                    <TextField
                        select
                        label="Category"
                        value={formData.category}
                        onChange={e => handleChange("category", e.target.value)}
                        fullWidth
                    >
                        {categories.map(cat => (
                            <MenuItem key={cat.value} value={cat.value}>
                                {cat.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            select
                            label="Count Unit"
                            value={formData.count_unit}
                            onChange={e => handleChange("count_unit", e.target.value)}
                            fullWidth
                            placeholder="e.g., bags, tubs, cartons"
                        >
                            {UNITS.map(u => (
                                <MenuItem key={u} value={u}>{u}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Order Unit"
                            value={formData.order_unit}
                            onChange={e => handleChange("order_unit", e.target.value)}
                            fullWidth
                            placeholder="e.g., cases, cartons"
                        >
                            {UNITS.map(u => (
                                <MenuItem key={u} value={u}>{u}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <TextField
                        label="Pack Size"
                        type="number"
                        value={formData.pack_size}
                        onChange={e => handleChange("pack_size", Math.max(1, parseInt(e.target.value, 10) || 1))}
                        InputProps={{ inputProps: { min: 1 } }}
                        fullWidth
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_active}
                                onChange={e => handleChange("is_active", e.target.checked)}
                            />
                        }
                        label="Item is Active"
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || !formData.name.trim()}
                >
                    {item ? "Update Item" : "Add Item"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

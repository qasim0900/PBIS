import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ChromePicker } from "react-color";
import { motion, AnimatePresence } from "framer-motion";
import TableView from "../../components/template";
import { Add, Close, Edit } from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    MenuItem,
} from "@mui/material";

//---------------------------------------
// :: Animations
//---------------------------------------
const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
};

const scaleIn = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { type: "spring", duration: 0.3 },
};

//---------------------------------------
// :: VendorDesign Component
//---------------------------------------
export default function VendorDesign({
    vendors,
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
    // :: Redux State (Locations)
    //---------------------------------------
    const { locations } = useSelector((state) => state.locations);

    //---------------------------------------
    // :: Local UI State
    //---------------------------------------
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [errors, setErrors] = useState({});

    //---------------------------------------
    // :: Update Form Field
    //---------------------------------------
    const updateForm = (key) => (e) =>
        setFormData({ ...formData, [key]: e.target?.value ?? e });

    //---------------------------------------
    // :: Validate Form
    //---------------------------------------
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Vendor Name is required";
        if (!formData.contact_person)
            newErrors.contact_person = "Contact Person is required";
        if (!formData.location)
            newErrors.location = "Please select a location";
        if (!formData.color) newErrors.color = "Vendor Color is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //---------------------------------------
    // :: Submit Handler
    //---------------------------------------
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) handleSubmit(e);
    };

    //---------------------------------------
    // :: Clear Errors on Click
    //---------------------------------------
    useEffect(() => {
        const clearErrors = () => setErrors({});
        document.addEventListener("click", clearErrors);
        return () => document.removeEventListener("click", clearErrors);
    }, []);

    //---------------------------------------
    // :: Table Columns
    //---------------------------------------
    const columns = [
        {
            header: "Vendor",
            render: ({ name, color }) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            bgcolor: color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {name?.[0]?.toUpperCase()}
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>{name}</Box>
                </Box>
            ),
        },
        { header: "Contact Person", render: (r) => r.contact_person || "—" },
        {
            header: "Location",
            render: (r) =>
                r.location_names?.length ? r.location_names.join(", ") : "—",
        },
        {
            header: "Phone",
            align: "center",
            render: (r) => (r.phone ? <Chip label={r.phone} size="small" /> : "—"),
        },
        {
            header: "Email",
            render: (r) => (r.email ? <Chip label={r.email} size="small" /> : "—"),
        },
    ];

    //---------------------------------------
    // :: Row Actions
    //---------------------------------------
    const actions = (row) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton size="small" color="primary" onClick={() => openDialog(row)}>
                <Edit fontSize="small" />
            </IconButton>
        </motion.div>
    );

    //---------------------------------------
    // :: Render
    //---------------------------------------
    return (
        <motion.div {...fadeIn}>
            <TableView
                title="Vendors"
                subtitle={`Manage vendors (${vendors.length})`}
                columns={columns}
                data={vendors}
                actions={actions}
                loading={loading}
                searchable
                showRefresh
                onRefresh={() => window.location.reload()}
                extraHeaderActions={
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => openDialog()}
                            sx={{
                                background: "linear-gradient(to right, #6366F1, #8B5CF6)",
                                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                            }}
                        >
                            Add Vendor
                        </Button>
                    </motion.div>
                }
            />

            <AnimatePresence>
                {open && (
                    <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                        <motion.div {...scaleIn}>
                            <DialogTitle
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontWeight: 600,
                                }}
                            >
                                {editing ? "Edit Vendor" : "Add Vendor"}
                                <IconButton onClick={closeDialog}>
                                    <Close />
                                </IconButton>
                            </DialogTitle>

                            <form onSubmit={handleFormSubmit} noValidate>
                                <DialogContent dividers>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <TextField
                                            select
                                            label="Location *"
                                            value={formData.location || ""}
                                            onChange={updateForm("location")}
                                            fullWidth
                                            error={!!errors.location}
                                            helperText={errors.location}
                                        >
                                            {locations.map(({ id, name }) => (
                                                <MenuItem key={id} value={id}>
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            label="Vendor Name *"
                                            value={formData.name}
                                            onChange={updateForm("name")}
                                            fullWidth
                                            error={!!errors.name}
                                            helperText={errors.name}
                                        />

                                        <TextField
                                            label="Contact Person *"
                                            value={formData.contact_person}
                                            onChange={updateForm("contact_person")}
                                            fullWidth
                                            error={!!errors.contact_person}
                                            helperText={errors.contact_person}
                                        />

                                        <TextField
                                            label="Phone"
                                            value={formData.phone}
                                            onChange={updateForm("phone")}
                                            fullWidth
                                        />

                                        <TextField
                                            label="Email"
                                            type="email"
                                            value={formData.email}
                                            onChange={updateForm("email")}
                                            fullWidth
                                        />

                                        <TextField
                                            label="Notes"
                                            multiline
                                            rows={3}
                                            value={formData.notes}
                                            onChange={updateForm("notes")}
                                            fullWidth
                                        />

                                        <TextField
                                            label="Vendor Color *"
                                            value={formData.color}
                                            onClick={() => setShowColorPicker(true)}
                                            fullWidth
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <Box
                                                        sx={{
                                                            width: 20,
                                                            height: 20,
                                                            bgcolor: formData.color,
                                                            borderRadius: 1,
                                                            mr: 1,
                                                        }}
                                                    />
                                                ),
                                            }}
                                            error={!!errors.color}
                                            helperText={errors.color}
                                        />

                                        {showColorPicker && (
                                            <Box sx={{ position: "relative" }}>
                                                <Box
                                                    sx={{ position: "fixed", inset: 0 }}
                                                    onClick={() => setShowColorPicker(false)}
                                                />
                                                <Box sx={{ position: "absolute", zIndex: 10 }}>
                                                    <ChromePicker
                                                        color={formData.color}
                                                        onChange={(c) =>
                                                            setFormData({ ...formData, color: c.hex })
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={closeDialog}>Cancel</Button>
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Button type="submit" variant="contained">
                                            {editing ? "Update" : "Create"}
                                        </Button>
                                    </motion.div>
                                </DialogActions>
                            </form>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
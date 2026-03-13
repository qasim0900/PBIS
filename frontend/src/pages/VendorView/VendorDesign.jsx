import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TableView from "../../components/template";
import VendorForm from "../../components/forms/VendorForm";
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
    // :: Local UI State
    //---------------------------------------
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
        if (!formData.name || !formData.name.trim()) {
            newErrors.name = "Vendor Name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //---------------------------------------
    // :: Handle form submission
    //---------------------------------------
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            handleSubmit();
        }
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
                                    <VendorForm values={formData} onChange={setFormData} errors={errors} />
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
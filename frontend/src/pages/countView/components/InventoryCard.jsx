import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";
import { updateSelectedSheetEntry } from "../countsSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hoverScale } from "../../../utils/animations";

import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    Alert,
} from "@mui/material";

const InventoryCard = ({ item }) => {
    const dispatch = useDispatch();
    const inputRef = useRef(null);

    const {
        id,
        storage_location = "",
        vendor_name = "",
        par_level = 0,
        order_point = 0,
        on_hand_quantity = 0,
        notes = "",
        pack_size = 1,
    } = item;

    const name = item.item?.name_display || item.name_display || item.item?.name || item.name || "Unknown Item";
    const brand_name = item.brand_name || item.item?.brand_name || "";
    const count_unit = item.count_unit || "units";
    const order_unit = item.order_unit || "units";
    const pack_ratio = item.pack_ratio_display || `1 ${order_unit} = 1 ${count_unit}`;

    const [localCount, setLocalCount] = useState(on_hand_quantity);
    const [localNotes, setLocalNotes] = useState(notes || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const [modalData, setModalData] = useState({
        on_hand_quantity,
        notes: notes || "",
        par_level,
        order_point,
    });

    useEffect(() => {
        setLocalCount(on_hand_quantity);
        setLocalNotes(notes || "");
        setModalData({ on_hand_quantity, notes: notes || "", par_level, order_point });
    }, [on_hand_quantity, notes, par_level, order_point]);

    const currentCount = Number(localCount) || 0;
    const par = Number(par_level) || 0;
    const orderPoint = Number(order_point) || 0;
    const packSize = Number(pack_size) || 1;

    const deficit = Math.max(0, par - currentCount);
    const qtyToOrderLocal = deficit;
    const orderUnitsLocal = deficit > 0 ? Math.ceil(deficit / packSize) : 0;

    const { borderColor, bgColor, statusTag } = useMemo(() => {
        const isCritical = currentCount <= orderPoint && currentCount < par;
        const isWarning = currentCount <= par && !isCritical;
        const borderColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#7c3aed";
        const bgColor = "#fff";
        const statusTag = isCritical ? (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "error.light",
                    color: "error.contrastText",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 10,
                    textTransform: 'uppercase'
                }}
            >
                Order Now
            </Box>
        ) : null;
        return { borderColor, bgColor, statusTag };
    }, [currentCount, par, orderPoint]);

    const saveChanges = useCallback(() => {
        const payload = {};
        if (Number(localCount) !== on_hand_quantity) {
            payload.on_hand_quantity = Number(localCount);
        }
        if (localNotes.trim() !== (notes || "").trim()) {
            payload.notes = localNotes.trim() || "";
        }
        if (Object.keys(payload).length) {
            dispatch(updateSelectedSheetEntry({ id, data: payload }));
        }
    }, [dispatch, id, localCount, localNotes, on_hand_quantity, notes]);

    const handleModalSave = useCallback(() => {
        const countValue = Number(modalData.on_hand_quantity);
        const parValue = Number(modalData.par_level);
        
        // Only validate that count is not negative
        if (countValue < 0) {
            alert("Current count cannot be negative");
            return;
        }
        
        dispatch(
            updateSelectedSheetEntry({
                id,
                data: {
                    on_hand_quantity: countValue,
                    notes: modalData.notes || "",
                    par_level: parValue,
                    order_point: Number(modalData.order_point),
                },
            })
        );
        setIsModalOpen(false);
        setShowWarning(false);
    }, [dispatch, id, modalData]);

    const handleCountChange = (value) => {
        const numValue = Number(value);
        
        // Only prevent negative values
        if (numValue < 0) {
            return; // Reject negative input
        }
        
        setShowWarning(false);
        setLocalCount(value);
        dispatch(updateSelectedSheetEntry({
            id,
            data: {
                on_hand_quantity: numValue,
                par_level: Number(modalData.par_level),
                order_point: Number(modalData.order_point)
            }
        }));
    };

    const handleKeyDown = (e) => {
        // Prevent comma, minus, and 'e' (scientific notation) but allow decimal point
        if ([",", "e", "E", "-", "+"].includes(e.key)) {
            e.preventDefault();
            return;
        }
        
        if (e.key === "Enter") {
            saveChanges();
            inputRef.current
                ?.closest(".card-item")
                ?.nextElementSibling?.querySelector("input")
                ?.focus();
        }
    };

    return (
        <motion.div {...hoverScale}>
            <Card
                variant="outlined"
                className="transition-all duration-300 card-item"
                sx={{
                    borderRadius: 4,
                    borderColor,
                    borderWidth: 2,
                    bgcolor: bgColor,
                    transition: 'all 0.3s ease'
                }}
            >
                <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "text.primary" }}>{name}</Typography>
                            {storage_location && (
                                <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>{storage_location}</Typography>
                            )}
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                            {statusTag}
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setModalData({ on_hand_quantity, notes: notes || "", par_level, order_point });
                                    setIsModalOpen(true);
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Box>

                    {(vendor_name || brand_name) && (
                        <Box sx={{ bgcolor: "rgba(0,0,0,0.02)", px: 1.5, py: 0.75, borderRadius: 1, mb: 1.5 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                {vendor_name && (
                                    <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600 }}>
                                        📦 {vendor_name}
                                    </Typography>
                                )}
                                {brand_name && (
                                    <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600 }}>
                                        🏷️ {brand_name}
                                    </Typography>
                                )}
                            </Stack>
                            <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 0.25 }}>{pack_ratio}</Typography>
                        </Box>
                    )}

                    <Box sx={{ borderTop: "1px solid", borderColor: "divider", my: 1.5 }} />

                    <Stack direction="row" spacing={1.5} justifyContent="space-between" mb={2}>
                        <Box textAlign="center" sx={{ flex: 1 }}>
                            <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>Par Level</Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5 }}>{par.toFixed(1)}</Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{count_unit}</Typography>
                        </Box>
                        <Box textAlign="center" sx={{ flex: 1 }}>
                            <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>Order Point</Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5 }}>{orderPoint.toFixed(1)}</Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{order_unit}</Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600, mb: 0.75 }}>
                            Enter Current Count ({order_unit})
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            value={localCount}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string for clearing
                                if (value === '') {
                                    setLocalCount('');
                                    return;
                                }
                                handleCountChange(value);
                            }}
                            onBlur={saveChanges}
                            onKeyDown={handleKeyDown}
                            inputRef={inputRef}
                            inputProps={{ 
                                step: "0.5", 
                                min: 0,
                                onInput: (e) => {
                                    // Only prevent negative values
                                    const value = Number(e.target.value);
                                    if (value < 0) {
                                        e.target.value = 0;
                                    }
                                }
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    textAlign: "center",
                                    bgcolor: "#fafafa",
                                    borderRadius: 2,
                                    border: `2px solid ${borderColor}`,
                                },
                            }}
                        />
                        <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 0.5, textAlign: "center" }}>
                            Valid count: 0+ {count_unit}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5, bgcolor: "rgba(0,0,0,0.02)", p: 1, borderRadius: 1 }}>
                        <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600, mb: 0.5 }}>
                            Calculation: {par.toFixed(1)} − {currentCount.toFixed(1)} = {qtyToOrderLocal.toFixed(1)} {count_unit}
                        </Typography>
                        {qtyToOrderLocal > 0 ? (
                            <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>
                                ≈ {orderUnitsLocal.toFixed(0)} {order_unit}
                            </Typography>
                        ) : (
                            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                                (Stock is at or above par level)
                            </Typography>
                        )}
                    </Box>

                    <TextField
                        label="Optional Notes (will appear on report)"
                        size="small"
                        multiline
                        rows={3}
                        fullWidth
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        onBlur={saveChanges}
                        sx={{ mb: 2 }}
                        placeholder="e.g., 2 bags were open..."
                    />

                    {currentCount <= orderPoint && currentCount < par && qtyToOrderLocal > 0 && (
                        <Box
                            sx={{
                                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                color: "#fff",
                                textAlign: "center",
                                py: 1.75,
                                px: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                fontSize: 15,
                                boxShadow: "0 4px 6px rgba(239,68,68,0.3)",
                            }}
                        >
                            <Box sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, opacity: 0.9 }}>ORDER IMMEDIATELY</Box>
                            <Box sx={{ fontSize: 18, fontWeight: 700 }}>
                                {orderUnitsLocal.toFixed(0)} {order_unit}
                            </Box>
                            {vendor_name && (
                                <Box sx={{ fontSize: 12, fontWeight: 600, mt: 0.5, opacity: 0.9 }}>
                                    from {vendor_name}
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
            <Dialog open={isModalOpen} onClose={() => {
                setIsModalOpen(false);
                setShowWarning(false);
            }}>
                <DialogTitle>Edit Inventory Item</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Current Count"
                            type="number"
                            value={modalData.on_hand_quantity}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string
                                if (value === '') {
                                    setModalData({ ...modalData, on_hand_quantity: '' });
                                    setShowWarning(false);
                                    return;
                                }
                                
                                const val = Number(value);
                                
                                // Only prevent negative values
                                if (val < 0) {
                                    return; // Reject negative input
                                }
                                
                                setShowWarning(false);
                                setModalData({ ...modalData, on_hand_quantity: value });
                            }}
                            onKeyDown={(e) => {
                                // Prevent invalid characters
                                if ([".", ",", "e", "E", "-", "+"].includes(e.key)) {
                                    e.preventDefault();
                                    return;
                                }
                            }}
                            error={showWarning}
                            helperText="Enter current count (0 or higher)"
                            inputProps={{ 
                                min: 0,
                                onInput: (e) => {
                                    const value = Number(e.target.value);
                                    if (value < 0) {
                                        e.target.value = 0;
                                    }
                                }
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Par Level"
                            type="number"
                            value={modalData.par_level}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || Number(value) >= 0) {
                                    setModalData({ ...modalData, par_level: value });
                                }
                            }}
                            onKeyDown={(e) => {
                                if ([".", ",", "e", "E", "-", "+"].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            inputProps={{ min: 0 }}
                            fullWidth
                        />
                        <TextField
                            label="Order Point"
                            type="number"
                            value={modalData.order_point}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || Number(value) >= 0) {
                                    setModalData({ ...modalData, order_point: value });
                                }
                            }}
                            onKeyDown={(e) => {
                                if ([".", ",", "e", "E", "-", "+"].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            inputProps={{ min: 0 }}
                            fullWidth
                        />
                        <TextField
                            label="Notes"
                            multiline
                            rows={3}
                            value={modalData.notes}
                            onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setIsModalOpen(false);
                        setShowWarning(false);
                    }}>Cancel</Button>
                    <Button 
                        onClick={handleModalSave} 
                        variant="contained"
                        disabled={showWarning}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
};

export default InventoryCard;

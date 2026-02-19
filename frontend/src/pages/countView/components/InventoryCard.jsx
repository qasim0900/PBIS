import { useDispatch } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import { updateSelectedSheetEntry } from "../countsSlice";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

        const borderColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
        const bgColor = isCritical ? "#fef2f2" : isWarning ? "#fffbeb" : "#f0fdf4";

        const statusTag = isCritical ? (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "#fecaca",
                    color: "#7f1d1d",
                    px: 2,
                    py: 0.75,
                    borderRadius: 20,
                    fontWeight: 700,
                    fontSize: 11,
                }}
            >
                <Box
                    sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "#dc2626",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: "bold",
                    }}
                >
                    ⚠
                </Box>
                ORDER NOW
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
        dispatch(
            updateSelectedSheetEntry({
                id,
                data: {
                    on_hand_quantity: Number(modalData.on_hand_quantity),
                    notes: modalData.notes || "",
                    par_level: Number(modalData.par_level),
                    order_point: Number(modalData.order_point),
                },
            })
        );
        setIsModalOpen(false);
    }, [dispatch, id, modalData]);
    const handleCountChange = (value) => {
        setLocalCount(value);

        dispatch(updateSelectedSheetEntry({
            id,
            data: { 
                on_hand_quantity: Number(value),
                par_level: Number(modalData.par_level),
                order_point: Number(modalData.order_point)
            }
        }));
    };
    const handleKeyDown = (e) => {
        if ([".", ",", "e", "E"].includes(e.key)) e.preventDefault();
        if (e.key === "Enter") {
            saveChanges();
            inputRef.current
                ?.closest(".card-item")
                ?.nextElementSibling?.querySelector("input")
                ?.focus();
        }
    };

    return (
        <Card
            variant="outlined"
            sx={{ borderRadius: 2, borderColor, borderWidth: 3, bgcolor: bgColor }}
            className="card-item"
        >
            <CardContent sx={{ pb: 2 }}>
                {/* Header */}
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

                {/* Vendor & Brand */}
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

                {/* Par & Order */}
                <Stack direction="row" spacing={1.5} justifyContent="space-between" mb={2}>
                    <Box textAlign="center" sx={{ flex: 1 }}>
                        <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>Par Level</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5 }}>{par.toFixed(1)}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{count_unit}</Typography>
                    </Box>
                    <Box textAlign="center" sx={{ flex: 1 }}>
                        <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>Order Point</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5 }}>{orderPoint.toFixed(1)}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{count_unit}</Typography>
                    </Box>
                </Stack>

                {/* Current Count */}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600, mb: 0.75 }}>
                        Enter Current Count ({count_unit})
                    </Typography>
                    <TextField
                        fullWidth
                        type="number"
                        value={localCount}
                        onChange={(e) => handleCountChange(e.target.value)}
                        onBlur={saveChanges}
                        onKeyDown={handleKeyDown}
                        inputRef={inputRef}
                        inputProps={{ step: "1", min: 0 }}
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
                </Box>

                {/* Calculation */}
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

                {/* Notes */}
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

                {/* Critical Banner */}
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

                {/* Modal */}
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Current Count"
                                type="number"
                                value={modalData.on_hand_quantity}
                                onChange={(e) => setModalData({ ...modalData, on_hand_quantity: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Par Level"
                                type="number"
                                value={modalData.par_level}
                                onChange={(e) => setModalData({ ...modalData, par_level: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Order Point"
                                type="number"
                                value={modalData.order_point}
                                onChange={(e) => setModalData({ ...modalData, order_point: e.target.value })}
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
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleModalSave} variant="contained">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default InventoryCard;

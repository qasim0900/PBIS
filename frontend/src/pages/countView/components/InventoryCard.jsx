import { useDispatch } from "react-redux";
import { updateCountEntry } from "../countsSlice";
import { showNotification } from "../../../api/uiSlice";
import { useMemo, useCallback, useRef, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    TextField,
    Typography,
    Stack,
} from "@mui/material";


//-----------------------------------
// :: Inventory Card Function
//-----------------------------------

/*
This `InventoryCard` component displays an item’s inventory details, allows editing the current 
count and notes, calculates order needs, highlights low/critical stock, and saves updates via Redux.
*/


const InventoryCard = ({ item }) => {
    const dispatch = useDispatch();
    const inputRef = useRef(null);


    //-----------------------------------
    // :: Items Variables
    //-----------------------------------

    /*
    This block destructures item data with defaults, derives display values (name, units, pack ratio), 
    and sets up local state plus numeric conversions for calculations.
    */

    const {
        id,
        item: catalogItem = {},
        storage_location = "",
        vendor_name = "",
        par_level = 0,
        order_point = 0,
        on_hand_quantity = 0,
        notes = "",
        calculated_qty_to_order = 0,
        calculated_order_units = 0,
        is_critical = true,
    } = item;

    const name = item.category_display || "Unknown Item";
    const count_unit = item.count_unit || "units";
    const order_unit = item.order_unit || "units";
    const pack_ratio =
        item.pack_ratio_display || `1 ${order_unit} = 1 ${count_unit}`;
    const [localCount, setLocalCount] = useState(on_hand_quantity);
    const [localNotes, setLocalNotes] = useState(notes || "");
    const currentCount = localCount === "" ? 0 : Number(localCount);
    const par = Number(par_level) || 0;
    const orderPoint = Number(order_point) || 0;
    const qtyToOrder = Number(calculated_qty_to_order) || 0;
    const orderUnits = Number(calculated_order_units) || 0;


    //-----------------------------------
    // :: Card Style Memo Function
    //-----------------------------------

    /*
    This memoised logic computes the card styling and status tag based on whether the item is 
    critical or below par level, returning different styles accordingly.
    */

    const { cardStyle, borderColor, statusTag } = useMemo(() => {
        if (is_critical) {
            return {
                cardStyle: {
                    borderColor: "#ef4444",
                    borderWidth: 3,
                    bgcolor: "#fef2f2",
                },
                borderColor: "#ef4444",
                statusTag: (
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
                ),
            };
        }

        if (currentCount <= par) {
            return {
                cardStyle: {
                    borderColor: "#f59e0b",
                    borderWidth: 3,
                    bgcolor: "#fffbeb",
                },
                borderColor: "#f59e0b",
                statusTag: null,
            };
        }


        //-----------------------------------
        // :: Card Return Code
        //-----------------------------------

        /*
        This final branch returns a green style (no warning tag) when the item is above par and not critical, 
        and the memo updates only when critical status, current count, or par level changes.
        */

        return {
            cardStyle: {
                borderColor: "#22c55e",
                borderWidth: 3,
                bgcolor: "#f0fdf4",
            },
            borderColor: "#22c55e",
            statusTag: null,
        };
    }, [is_critical, currentCount, par]);


    //-----------------------------------
    // :: Save Change Function
    //-----------------------------------

    /*
    This callback updates the item if the count or notes changed, shows a success notification 
    on success, and reverts local state with an error notification on failure.
    */

    const saveChanges = useCallback(async () => {
        const updateData = {};
        if (Number(localCount) !== on_hand_quantity)
            updateData.on_hand_quantity = Number(localCount);
        if (localNotes.trim() !== (notes || "").trim())
            updateData.notes = localNotes.trim() || "";

        if (!Object.keys(updateData).length) return;

        try {
            await dispatch(updateCountEntry({ id, data: updateData })).unwrap();
            dispatch(showNotification({ message: "Updated successfully", type: "success" }));
        } catch {
            setLocalCount(on_hand_quantity);
            setLocalNotes(notes);
            dispatch(showNotification({ message: "Failed to save", type: "error" }));
        }
    }, [dispatch, id, localCount, localNotes, on_hand_quantity, notes]);


    //-----------------------------------
    // :: Handle Key Down Function
    //-----------------------------------

    /*
    This handler prevents invalid number input characters and, on Enter, saves changes and moves 
    focus to the next card’s input field.
    */

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


    //-----------------------------------
    // :: Return Code
    //-----------------------------------

    /*
    This JSX renders an inventory card showing item details, editable current count and notes, 
    order calculations, and visual warnings for low or critical stock.
    */

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, ...cardStyle }} className="card-item">
            <CardContent sx={{ pb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "text.primary" }}>
                            {name}
                        </Typography>
                        {storage_location && (
                            <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>
                                {storage_location}
                            </Typography>
                        )}
                    </Box>
                    {statusTag}
                </Box>

                {vendor_name && (
                    <Box sx={{ bgcolor: "rgba(0,0,0,0.02)", px: 1.5, py: 0.75, borderRadius: 1, mb: 1.5 }}>
                        <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600 }}>
                            📦 {vendor_name}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 0.25 }}>
                            {pack_ratio}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ borderTop: "1px solid", borderColor: "divider", my: 1.5 }} />

                <Stack direction="row" spacing={1.5} justifyContent="space-between" mb={2}>
                    <Box textAlign="center" sx={{ flex: 1 }}>
                        <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>Par Level</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5, color: "text.primary" }}>
                            {par.toFixed(1)}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{count_unit}</Typography>
                    </Box>
                    <Box textAlign="center" sx={{ flex: 1 }}>
                        <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>
                            Order Point
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5, color: "text.primary" }}>
                            {orderPoint.toFixed(1)}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{count_unit}</Typography>
                    </Box>
                </Stack>

                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600, mb: 0.75 }}>
                        Enter Current Count ({count_unit})
                    </Typography>
                    <TextField
                        fullWidth
                        type="number"
                        value={localCount}
                        onChange={(e) => setLocalCount(e.target.value === "" ? "" : Number(e.target.value))}
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

                <Box sx={{ mb: 1.5, bgcolor: "rgba(0,0,0,0.02)", p: 1, borderRadius: 1 }}>
                    <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600, mb: 0.5 }}>
                        Calculation: {par.toFixed(1)} − {currentCount.toFixed(1)} = {qtyToOrder.toFixed(1)} {count_unit}
                    </Typography>

                    {qtyToOrder > 0 ? (
                        <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>
                            ≈ {orderUnits.toFixed(0)} {order_unit}
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
                    placeholder="e.g., 2 bags were open, or low on pineapple chunks"
                />

                {is_critical && (
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
                            boxShadow: "0 4px 6px rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        <Box sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, opacity: 0.9 }}>
                            ORDER IMMEDIATELY
                        </Box>
                        <Box sx={{ fontSize: 18, fontWeight: 700 }}>
                            {orderUnits.toFixed(0)} {order_unit}
                        </Box>
                        <Box sx={{ fontSize: 12, fontWeight: 600, mt: 0.5, opacity: 0.9 }}>
                            {vendor_name && `from ${vendor_name}`}
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

//-----------------------------------
// :: Export Inventory Card
//-----------------------------------

/*
This exports the `InventoryCard` component so it can be used elsewhere in the app.
*/

export default InventoryCard;

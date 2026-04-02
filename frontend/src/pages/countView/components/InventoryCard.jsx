import { motion as Motion } from "framer-motion";
import { useDispatch } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import { hoverScale } from "../../../utils/animations";
import { updateSelectedSheetEntry } from "../countsSlice";
import { useCallback, useMemo, useRef, useState } from "react";
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

//----------------------------------------
// :: InventoryCard Component
//----------------------------------------

/*
InventoryCard represents a single inventory item within the count view. It displays key information about the item, including its name, storage location, vendor, brand, par level, order point, and current on-hand quantity. The card visually indicates when stock is 
low and provides an interface for users to quickly update counts and notes.
*/

const InventoryCard = ({ item }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const {
    id,
    storage_location = "",
    vendor_name = "",
    par_level = 0,
    order_point = 0,
    on_hand_quantity = null,
    notes = "",
    pack_size = 1,
  } = item;

  const name =
    item.item?.name_display ||
    item.name_display ||
    item.item?.name ||
    item.name ||
    "Unknown Item";
  const brand_name = item.brand_name || item.item?.brand_name || "";
  const count_unit = item.count_unit || "units";
  const order_unit = item.order_unit || "units";
  const pack_ratio =
    item.pack_ratio_display || `1 ${order_unit} = 1 ${count_unit}`;

  const [localCount, setLocalCount] = useState("");
  const [localNotes, setLocalNotes] = useState(notes || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [modalData, setModalData] = useState({
    on_hand_quantity: on_hand_quantity !== null ? on_hand_quantity : "",
    notes: notes || "",
    par_level,
    order_point,
  });

  const currentCount = localCount === "" ? null : Number(localCount);
  const par = Number(par_level) || 0;
  const orderPoint = Number(order_point) || 0;
  const packSize = Number(pack_size) || 1;
  const deficit = currentCount !== null ? Math.max(0, par - currentCount) : 0;
  const qtyToOrderLocal = deficit;
  const orderUnitsLocal = deficit > 0 ? Math.ceil(deficit / packSize) : 0;

  //------------------------------
  // :: Memoized Styles and Status
  //------------------------------

  /* 
  Memoizes the border color, background color, and status tag based on the current count relative to par and order point. 
  This ensures that the card visually reflects the urgency of restocking the item, with critical items highlighted in red and warnings in orange.
  */

  const { borderColor, bgColor, statusTag } = useMemo(() => {
    const isCritical = currentCount !== null && currentCount <= orderPoint && currentCount < par;
    const isWarning = currentCount !== null && currentCount <= par && !isCritical;
    return {
      borderColor: isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#7c3aed",
      bgColor: "#fff",
      statusTag: isCritical && (
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
            textTransform: "uppercase",
          }}
        >
          Order Now
        </Box>
      ),
    };
  }, [currentCount, par, orderPoint]);

  //------------------------------
  // :: Save Changes Handler
  //------------------------------

  /* 
  Handler to save changes to the count and notes. It compares the local state with the original 
  values and dispatches an update action if there are changes. This ensures that updates are only sent to the backend when necessary, 
  reducing unnecessary API calls.
  */

  const saveChanges = useCallback(() => {
    const newCount = localCount === "" ? null : Number(localCount);
    const payload = {
      ...(newCount !== on_hand_quantity && {
        on_hand_quantity: newCount,
      }),
      ...(localNotes.trim() !== (notes || "").trim() && {
        notes: localNotes.trim() || "",
      }),
    };
    if (Object.keys(payload).length)
      dispatch(updateSelectedSheetEntry({ id, data: payload }));
  }, [dispatch, id, localCount, localNotes, on_hand_quantity, notes]);

  //-----------------------------
  // :: Modal Save Handler
  //-----------------------------

  /*
  Modal save handler that validates the input count and par level before dispatching an update action. 
  It ensures that the current count cannot be negative and updates the Redux store with the new values from the modal. If validation fails, it shows a warning message to the user.
  */

  const handleModalSave = useCallback(() => {
    const rawVal = modalData.on_hand_quantity;
    const count = rawVal === "" ? null : Number(rawVal);
    if (count !== null && count < 0) return alert("Current count cannot be negative");
    dispatch(
      updateSelectedSheetEntry({
        id,
        data: {
          ...modalData,
          on_hand_quantity: count,
          par_level: Number(modalData.par_level),
          order_point: Number(modalData.order_point),
          notes: modalData.notes || "",
        },
      }),
    );
    setIsModalOpen(false);
    setShowWarning(false);
  }, [dispatch, id, modalData]);

  //-----------------------------------------
  // :: Count Change Handler for Main Input
  //----------------------------------------

  /*
  Handler for changes to the main count input field. It validates that the input is a non-negative number and updates the local state accordingly. If the input is invalid, it prevents the change and does not update the state.
  */

  const handleCountChange = (value) => {
    if (value === "") {
      setLocalCount("");
      setShowWarning(false);
      dispatch(updateSelectedSheetEntry({ id, data: { on_hand_quantity: null } }));
      return;
    }

    const num = Number(value);
    if (num < 0) return;
    setLocalCount(num);
    setShowWarning(false);

    dispatch(
      updateSelectedSheetEntry({
        id,
        data: {
          on_hand_quantity: num,
          par_level: Number(modalData.par_level),
          order_point: Number(modalData.order_point),
        },
      }),
    );
  };

  //-----------------------------------------
  // :: Key Down Handler for Main Input
  //-----------------------------------------

  /*
    Handler for key down events on the main count input. It prevents invalid characters from being entered (such as 'e', '-', '+', etc.) 
    and allows the user to press Enter to save changes and move focus to the next input field. This enhances the user experience by ensuring only valid numeric input is accepted and streamlining data entry.
    */

  const handleKeyDown = (e) => {
    if ([",", "e", "E", "-", "+"].includes(e.key)) e.preventDefault();
    if (e.key === "Enter") {
      saveChanges();
      inputRef.current
        ?.closest(".card-item")
        ?.nextElementSibling?.querySelector("input")
        ?.focus();
    }
  };

  //-----------------------------
  // :: Render
  //-----------------------------

  /*
  Renders the inventory card with all relevant information and interactive elements. It includes conditional styling based on stock levels, 
  an edit button that opens a modal for detailed editing, and input fields for updating counts and notes. The card also displays calculations for how much to order based on the current count and par level, providing users with clear guidance on restocking needs.
  */

  return (
    <Motion.div {...hoverScale}>
      <Card
        variant="outlined"
        className="transition-all duration-300 card-item"
        sx={{
          borderRadius: 4,
          borderColor,
          borderWidth: 2,
          bgcolor: bgColor,
          transition: "all 0.3s ease",
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, color: "text.primary" }}
              >
                {name}
              </Typography>
              {storage_location && (
                <Typography
                  sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}
                >
                  {storage_location}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {statusTag}
              <IconButton
                size="small"
                onClick={() => {
                  setModalData({
                    on_hand_quantity: localCount,
                    notes: localNotes || "",
                    par_level,
                    order_point,
                  });
                  setIsModalOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Vendor & Brand */}
          {(vendor_name || brand_name) && (
            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.02)",
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                mb: 1.5,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                {vendor_name && (
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    📦 {vendor_name}
                  </Typography>
                )}
                {brand_name && (
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    🏷️ {brand_name}
                  </Typography>
                )}
              </Stack>
              <Typography
                sx={{ color: "text.secondary", fontSize: 11, mt: 0.25 }}
              >
                {pack_ratio}
              </Typography>
            </Box>
          )}

          <Box
            sx={{ borderTop: "1px solid", borderColor: "divider", my: 1.5 }}
          />

          {/* Par & Order */}
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="space-between"
            mb={2}
          >
            {[
              { label: "Par Level", value: par, unit: count_unit },
              { label: "Order Point", value: orderPoint, unit: order_unit },
            ].map(({ label, value, unit }) => (
              <Box key={label} textAlign="center" sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5 }}>
                  {value.toFixed(1)}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                  {unit}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Count Input & Calculation */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 12,
                fontWeight: 600,
                mb: 0.75,
              }}
            >
              Enter Current Count ({order_unit})
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={localCount}
              onChange={(e) => handleCountChange(e.target.value)}
              onBlur={saveChanges}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              inputProps={{
                step: "0.5",
                min: 0,
                placeholder: "Not counted", // show blank placeholder
                onInput: (e) => {
                  if (Number(e.target.value) < 0) e.target.value = 0;
                },
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
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 11,
                mt: 0.5,
                textAlign: "center",
              }}
            >
              Valid count: 0+ {count_unit}
            </Typography>
          </Box>

          <Box
            sx={{ mb: 1.5, bgcolor: "rgba(0,0,0,0.02)", p: 1, borderRadius: 1 }}
          >
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 11,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Calculation: {par.toFixed(1)} − {currentCount !== null ? currentCount.toFixed(1) : "?"} ={" "}
              {currentCount !== null ? qtyToOrderLocal.toFixed(1) : "?"} {count_unit}
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 11,
                fontWeight: qtyToOrderLocal > 0 ? 600 : 400,
              }}
            >
              {qtyToOrderLocal > 0
                ? `≈ ${orderUnitsLocal.toFixed(0)} ${order_unit}`
                : "(Stock is at or above par level)"}
            </Typography>
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

          {currentCount !== null &&
            currentCount <= orderPoint &&
            currentCount < par &&
            qtyToOrderLocal > 0 && (
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
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
                <Box
                  sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, opacity: 0.9 }}
                >
                  ORDER IMMEDIATELY
                </Box>
                <Box sx={{ fontSize: 18, fontWeight: 700 }}>
                  {orderUnitsLocal.toFixed(0)} {order_unit}
                </Box>
                {vendor_name && (
                  <Box
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      mt: 0.5,
                      opacity: 0.9,
                    }}
                  >
                    from {vendor_name}
                  </Box>
                )}
              </Box>
            )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShowWarning(false);
        }}
      >
        <DialogTitle>Edit Inventory Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {["on_hand_quantity", "par_level", "order_point"].map((key) => (
              <TextField
                key={key}
                label={
                  key === "on_hand_quantity"
                    ? "Current Count"
                    : key
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                }
                type="number"
                value={modalData[key]}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0)
                    setModalData({ ...modalData, [key]: val });
                  if (key === "on_hand_quantity") setShowWarning(false);
                }}
                onKeyDown={(e) =>
                  ["-", "+", "e", "E", ".", ","].includes(e.key) &&
                  e.preventDefault()
                }
                inputProps={{ min: 0 }}
                fullWidth
                error={key === "on_hand_quantity" ? showWarning : undefined}
                helperText={
                  key === "on_hand_quantity"
                    ? "Enter current count (0 or higher)"
                    : undefined
                }
              />
            ))}
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={modalData.notes}
              onChange={(e) =>
                setModalData({ ...modalData, notes: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsModalOpen(false);
              setShowWarning(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleModalSave}
            variant="contained"
            disabled={showWarning}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Motion.div>
  );
};

//-----------------------------
// :: Export
//-----------------------------

/*
Exports the InventoryCard component as the default export of the module, allowing it to be imported and used in other parts of 
the application, such as within the CountView page where it will display individual inventory items.
*/

export default InventoryCard;

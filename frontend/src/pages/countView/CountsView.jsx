import countsAPI from "./countsAPI";
import { showNotification } from "../uiSlice";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import locationsAPI from "../locationView/locationsAPI";
import { Refresh, CheckCircle } from "@mui/icons-material";
import {
  setSelectedSheet,
  updateCountEntry,
} from "./countsSlice";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Paper,
  Stack,
  Skeleton,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Page Header Component
const PageHeader = ({ title, subtitle, children, showRefresh = false, onRefresh }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mb: { xs: 0, sm: 0 } }}>
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{ borderBottom: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}
      >
        <Toolbar
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            py: 2,
            gap: 2,
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, color: "text.primary" }}>
                {title}
              </Typography>
              {showRefresh && (
                <IconButton onClick={onRefresh} size="small">
                  <Refresh fontSize="small" />
                </IconButton>
              )}
            </Box>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {children && <Box sx={{ width: { xs: "100%", sm: "auto" } }}>{children}</Box>}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

// Inventory Card Component (Updated)
const InventoryCard = ({ item }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const {
    id,
    item: catalogItem = {},
    storage_location = "",
    vendor_name = "",
    par_level = 0,
    order_point = 0,
    on_hand_quantity = 0,
    calculated_qty_to_order = 0,
    calculated_order_units = 0,
    is_critical = false,
  } = item;

  const name = catalogItem.name || "Unknown Item";
  const count_unit = catalogItem.count_unit || "units";
  const order_unit = catalogItem.order_unit || "units";
  const pack_ratio = item.pack_ratio_display || `1 ${order_unit} = 1 ${count_unit}`;

  const [localCount, setLocalCount] = useState(on_hand_quantity);

  const currentCount = localCount === "" ? 0 : Number(localCount);
  const par = Number(par_level) || 0;
  const orderPoint = Number(order_point) || 0;
  const qtyToOrder = Number(calculated_qty_to_order) || 0;
  const orderUnits = Number(calculated_order_units) || 0;

  let cardStyle = {};
  let statusTag = null;
  let borderColor = "#22c55e";

  if (is_critical) {
    cardStyle = { borderColor: "#ef4444", borderWidth: 3, bgcolor: "#fef2f2" };
    borderColor = "#ef4444";
    statusTag = (
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
        <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "#dc2626", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>
          ⚠
        </Box>
        ORDER NOW
      </Box>
    );
  } else if (currentCount <= par) {
    cardStyle = { borderColor: "#f59e0b", borderWidth: 3, bgcolor: "#fffbeb" };
    borderColor = "#f59e0b";
  } else {
    cardStyle = { borderColor: "#22c55e", borderWidth: 3, bgcolor: "#f0fdf4" };
    borderColor = "#22c55e";
  }

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalCount(val === "" ? "" : Number(val));
  };

  const handleBlur = async () => {
    const newVal = localCount === "" ? 0 : localCount;
    if (newVal === on_hand_quantity) return;

    try {
      await dispatch(updateCountEntry({ id, data: { on_hand_quantity: newVal } })).unwrap();
      dispatch(showNotification({ message: "Count updated", type: "success" }));
    } catch {
      setLocalCount(on_hand_quantity);
      dispatch(showNotification({ message: "Failed to save", type: "error" }));
    }
  };

  const handleKeyDown = (e) => {
    if ([".", ",", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "Enter") {
      handleBlur();
      const nextInput =
        inputRef.current
          ?.closest(".card-item")
          ?.nextElementSibling
          ?.querySelector("input");
      nextInput?.focus();
    }
  };


  return (
    <Card variant="outlined" sx={{ borderRadius: 2, ...cardStyle }} className="card-item">
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "text.primary" }}>{name}</Typography>
            {storage_location && <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>{storage_location}</Typography>}
          </Box>
          {statusTag}
        </Box>

        {vendor_name && (
          <Box sx={{ bgcolor: "rgba(0,0,0,0.02)", px: 1.5, py: 0.75, borderRadius: 1, mb: 1.5 }}>
            <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600 }}>📦 {vendor_name}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 0.25 }}>{pack_ratio}</Typography>
          </Box>
        )}

        <Box sx={{ borderTop: "1px solid", borderColor: "divider", my: 1.5 }} />

        <Stack direction="row" spacing={1.5} justifyContent="space-between" mb={2}>
          <Box textAlign="center" sx={{ flex: 1 }}>
            <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>Par Level</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5, color: "text.primary" }}>{par.toFixed(1)}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{count_unit}</Typography>
          </Box>
          <Box textAlign="center" sx={{ flex: 1 }}>
            <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>Order Point</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mt: 0.5, color: "text.primary" }}>{orderPoint.toFixed(1)}</Typography>
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
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            inputProps={{ min: 0, step: 1 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "2.2rem",
                fontWeight: 700,
                textAlign: "center",
                bgcolor: "#fafafa",
                borderRadius: 2,
                border: `2px solid ${borderColor}`,
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 1.5, bgcolor: "rgba(0,0,0,0.02)", p: 1.5, borderRadius: 1.5 }}>
          <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600, mb: 0.5 }}>
            Calculation: {par.toFixed(1)} − {currentCount.toFixed(1)} = {qtyToOrder.toFixed(1)} {count_unit}
          </Typography>
          {qtyToOrder > 0 ? (
            <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 600 }}>
              ≈ {orderUnits.toFixed(0)} {order_unit}
            </Typography>
          ) : (
            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>(Stock is at or above par level)</Typography>
          )}
        </Box>

        {is_critical && qtyToOrder > 0 && (
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
            <Box sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, opacity: 0.9 }}>ORDER IMMEDIATELY</Box>
            <Box sx={{ fontSize: 18, fontWeight: 700 }}>{orderUnits.toFixed(0)} {order_unit}</Box>
            <Box sx={{ fontSize: 12, fontWeight: 600, mt: 0.5, opacity: 0.9 }}>
              {vendor_name && `from ${vendor_name}`}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Card View
const CardView = ({ data = [], loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  if (!data.length) {
    return (
      <Card sx={{ textAlign: "center", py: { xs: 6, sm: 8 } }}>
        <CardContent>
          <CheckCircle sx={{ fontSize: { xs: 60, sm: 80 }, color: "success.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
            All clear!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            No items to count
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
      <Box
        sx={{
          display: "grid",
          gap: { xs: 1.5, sm: 2 },
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
          p: { xs: 0.5, sm: 1 },
        }}
      >
        {data.map((entry) => (
          <InventoryCard key={entry.id} item={entry} />
        ))}
      </Box>
    </Box>
  );
};


const frequencyOptions = [
  { label: "Mon/Wed", value: "mon_wed" },
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "bi_weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Semi-Annual", value: "semi_annual" },
  { label: "Annual", value: "annual" },
];


const CountsView = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { entries, selectedSheet, loading } = useSelector((state) => state.counts);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    locationsAPI.getAll()
      .then((res) => setLocations(res.data?.results || res.data || []))
      .catch(() => dispatch(showNotification({ message: "Failed to load locations", type: "error" })));
  }, [dispatch]);

  const handleLoadData = async () => {
    if (!selectedLocation || !selectedFrequency) return;

    setLocalLoading(true);
    try {
      const res = await countsAPI.getTodaySheet(selectedLocation, selectedFrequency);
      const sheet = res.data;

      dispatch(setSelectedSheet(sheet));
      dispatch({ type: "counts/clearEntries" });
      dispatch({ type: "counts/fetchEntries/fulfilled", payload: sheet.entries || [] });

      dispatch(showNotification({ message: "Sheet loaded with items!", type: "success" }));
    } catch (err) {
      console.error(err);
      dispatch(showNotification({ message: "Failed to load sheet", type: "error" }));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSheet) return;
    setSubmitting(true);
    try {
      await countsAPI.submitSheet(selectedSheet.id);
      dispatch(showNotification({ message: "Count submitted successfully!", type: "success" }));
    } catch {
      dispatch(showNotification({ message: "Already Submitted", type: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  const completed = entries.filter((e) => e.on_hand_quantity > 0).length;
  const progress = entries.length ? Math.round((completed / entries.length) * 100) : 0;
  const isComplete = progress === 100;

  return (
    <Box sx={{ pt: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 1, sm: 2 } }}>
      <PageHeader title="Survey Count" subtitle="Enter current inventory counts">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, width: isMobile ? "100%" : "auto" }}>
          <TextField
            select
            size="small"
            label="Location"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedFrequency("");
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Select Location</MenuItem>
            {locations.map((l) => (
              <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Frequency"
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Select Frequency</MenuItem>
            {frequencyOptions.map((f) => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={handleLoadData}
            disabled={!selectedLocation || !selectedFrequency || localLoading}
          >
            {localLoading ? "Loading..." : "Load Sheet"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={!selectedSheet || submitting}
          >
            {submitting ? "Submitting..." : "Submit Count"}
          </Button>
        </Box>
      </PageHeader>

      {selectedSheet && entries.length > 0 && (
        <Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={isComplete ? "success" : "error"}
            sx={{ height: 4, borderRadius: 1, bgcolor: "#e0e0e0" }}
          />
        </Box>
      )}

      <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <CardView data={entries} loading={loading} />
      </Paper>
    </Box>
  );
};

export default CountsView;

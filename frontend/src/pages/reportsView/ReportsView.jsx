import { useDispatch, useSelector } from "react-redux";
import { listReports, deleteReport } from "./reportsSlice";
import ReportsViewUI from "./ReportsViewUI";
import { showNotification } from "../../api/uiSlice";
import { selectUser } from "../loginView/authSlice";
import { fetchLocations } from "../locationView/locationsSlice";
import { fetchFrequencies } from "../FrequencyView/frequencySlice";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import ColorBadge from "../../components/ColorBadge";

const ReportsView = () => {
  const dispatch = useDispatch();
  const username = useSelector(selectUser)?.username || "User";

  const { data: reports, loading } = useSelector((state) => state.reports);

  const [locations, setLocations] = useState([]);
  const [frequencies, setFrequencies] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchLocations()).unwrap().then(setLocations);
    dispatch(fetchFrequencies()).unwrap().then(setFrequencies);
  }, [dispatch]);

  const availableDates = useMemo(() => {
    if (!reports) return [];
    const list = reports?.results || reports || [];
    // Extract unique dates from period_start
    const dates = [...new Set(list.map(r => r.period_start))];
    return dates.sort((a, b) => new Date(b) - new Date(a));
  }, [reports]);

  const filteredReports = useMemo(() => {
    let list = reports?.results || reports || [];
    if (selectedLocation) {
        list = list.filter(r => r.location === selectedLocation || r.location?.id === selectedLocation);
    }
    if (selectedFrequency) {
        list = list.filter(r => r.frequency === selectedFrequency || r.frequency?.id === selectedFrequency);
    }
    if (selectedDate) {
        list = list.filter(r => r.period_start === selectedDate);
    }
    return list;
  }, [reports, selectedLocation, selectedFrequency, selectedDate]);

  const handleLoadReports = useCallback(async () => {
    try {
      await dispatch(listReports()).unwrap();
      dispatch(showNotification({ message: "Reports loaded successfully!", type: "success" }));
    } catch (err) {
      dispatch(showNotification({ message: "Failed to load reports", type: "error" }));
    }
  }, [dispatch]);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await dispatch(deleteReport(itemToDelete)).unwrap();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const rows = useMemo(() => {
    const list = filteredReports;
    return list.flatMap((sheet) =>
      (sheet.count_entries || []).map((entry) => ({
        id: entry.id,
        sheetId: sheet.id,
        item: entry.item_detail.name,
        vendor: entry.item_detail.vendor_name,
        storage: entry.item_detail.storage_location,
        currentCount: entry.on_hand_quantity,
        status: entry.highlight_state,
        orderQuantity: entry.calculated_order_units,
        orderUnit: entry.item_detail.order_unit,
        notes: entry.notes || entry.item_detail.notes,
      }))
    );
  }, [filteredReports]);

  const reportColumns = useMemo(() => [
    { header: "Item", render: (r) => r.item || "—" },
    { header: "Vendor", render: (r) => r.vendor || "—" },
    { header: "Storage", render: (r) => r.storage || "—" },
    {
      header: "Current Count",
      render: (r) => `${r.currentCount} ${r.orderUnit || ""}`.trim(),
    },
    {
      header: "Status",
      render: (r) => (
        <ColorBadge
          status={r.status}
          labels={{
            red: "Order Needed",
            yellow: "OK",
            green: "Over Par",
          }}
        />
      ),
    },
    {
      header: "Order Quantity",
      render: (r) =>
        Number(r.orderQuantity) > 0 ? (
          <Typography fontWeight={700} color="error.main">
            {r.orderQuantity} {r.orderUnit}
          </Typography>
        ) : (
          <Typography color="success.main">—</Typography>
        ),
    },
    { header: "Notes", render: (r) => r.notes || "—" },
    {
      header: "Actions",
      render: (r) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Count">
            <IconButton size="small" color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Entry">
            <IconButton size="small" color="error" onClick={() => handleDeleteClick(r.sheetId)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [dispatch]);

  return (
    <>
      <ReportsViewUI
        locations={locations}
        frequencies={frequencies}
        availableDates={availableDates}
        selectedLocation={selectedLocation}
        setSelectedLocation={(val) => {
          setSelectedLocation(val);
          setSelectedFrequency("");
          setSelectedDate("");
          setSelectedReport(null);
        }}
        selectedFrequency={selectedFrequency}
        setSelectedFrequency={(val) => {
          setSelectedFrequency(val);
          setSelectedDate("");
          setSelectedReport(null);
        }}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        sheets={filteredReports}
        selectedSheet={selectedReport}
        handleSheetChange={(id) => {
          const report = filteredReports.find((r) => r.id === id);
          setSelectedReport(report);
        }}
        handleLoadSheets={handleLoadReports}
        loading={loading}
        reportColumns={reportColumns}
        data={rows}
        username={username}
      />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportsView;

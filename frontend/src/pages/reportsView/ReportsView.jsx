import { useDispatch, useSelector } from "react-redux";
import { listReports, deleteReport } from "./reportsSlice";
import ReportsViewUI from "./ReportsViewUI";
import AppLoading from "../../components/AppLoading";
import { showNotification } from "../../api/uiSlice";
import { selectUser } from "../loginView/authSlice";
import { fetchLocations } from "../locationView/locationsSlice";
import { fetchFrequencies } from "../FrequencyView/frequencySlice";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import ColorBadge from "../../components/ColorBadge";
import { downloadCSVReport } from "./csvView";
import { printReport } from './printView';
import { updateCountEntry, deleteCountEntry } from "../countView/countsSlice";

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

  // Table data state
  const [rows, setRows] = useState([]);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  // Edit modal + confirmation
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // Dropdown data
  const [itemsDropdown, setItemsDropdown] = useState([]);
  const [vendorsDropdown, setVendorsDropdown] = useState([]);

  // Fetch locations and frequencies
  useEffect(() => {
    dispatch(fetchLocations()).unwrap().then(setLocations);
    dispatch(fetchFrequencies()).unwrap().then(setFrequencies);
  }, [dispatch]);

  // Available report dates
  const availableDates = useMemo(() => {
    if (!reports) return [];
    const list = reports?.results || reports || [];
    const dates = [...new Set(list.map(r => r.period_start))];
    return dates.sort((a, b) => new Date(b) - new Date(a));
  }, [reports]);

  // Filter reports based on selection
  const filteredReports = useMemo(() => {
    let list = reports?.results || reports || [];

    if (selectedLocation) {
      list = list.filter(
        (r) => Number(r.location?.id) === Number(selectedLocation)
      );
    }

    if (selectedDate) {
      list = list.filter((r) => r.period_start === selectedDate);
    }

    return list;
  }, [reports, selectedLocation, selectedDate]);

  // Convert reports -> table rows
  useEffect(() => {
    const list = filteredReports || [];
    const allRows = list.flatMap((sheet) =>
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
        notes: entry.notes,
        itemId: entry.item_detail.id,
        order_point: entry.item_detail.order_point,
        par_level: entry.item_detail.par_level
      }))
    );

    setRows(allRows);

    setItemsDropdown([...new Set(allRows.map(r => ({ id: r.itemId, name: r.item })))]);
    setVendorsDropdown([...new Set(allRows.map(r => r.vendor))]);

  }, [filteredReports]);

  // ----------------------
  // Load Reports
  // ----------------------
  const handleLoadReports = useCallback(async () => {
    // Validation
    if (!selectedLocation) {
      dispatch(showNotification({
        message: "Please select a location first",
        type: "warning"
      }));
      return;
    }

    if (!selectedFrequency) {
      dispatch(showNotification({
        message: "Please select an Inventory List first",
        type: "warning"
      }));
      return;
    }

    try {
      const result = await dispatch(
        listReports({
          location: selectedLocation,
          frequency: selectedFrequency,
          latest_only: "true"
        })
      ).unwrap();

      // Check if result has data
      const reportCount = result?.results?.length || result?.length || 0;
      
      if (reportCount === 0) {
        dispatch(showNotification({
          message: "No reports found for the selected location and inventory list",
          type: "info"
        }));
      } else {
        dispatch(showNotification({
          message: `✓ Loaded ${reportCount} report(s) successfully`,
          type: "success"
        }));
      }
    } catch (err) {
      console.error('Load reports error:', err);
      
      const errorMessage = err?.message || 
                          err?.error || 
                          "Failed to load reports. Please check your connection and try again.";
      
      dispatch(showNotification({
        message: errorMessage,
        type: "error"
      }));
    }
  }, [dispatch, selectedLocation, selectedFrequency]);

  // ----------------------
  // Unified Delete Logic
  // ----------------------
  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry || { sheetId: true }); // entry = null for full report
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      if (entryToDelete.sheetId && entryToDelete.id) {
        // Individual entry delete
        await dispatch(deleteCountEntry(entryToDelete.id)).unwrap();
        dispatch(showNotification({ 
          message: `✓ Entry "${entryToDelete.item}" deleted successfully`, 
          type: "success" 
        }));
      } else if (entryToDelete.sheetId) {
        // Full report delete - validate first
        if (!selectedLocation) {
          dispatch(showNotification({
            message: "Please select a location first",
            type: "warning"
          }));
          setDeleteConfirmOpen(false);
          setEntryToDelete(null);
          return;
        }
        
        if (!selectedFrequency) {
          dispatch(showNotification({
            message: "Please select an Inventory List first",
            type: "warning"
          }));
          setDeleteConfirmOpen(false);
          setEntryToDelete(null);
          return;
        }
        
        await dispatch(deleteReport({
          location_id: selectedLocation,
          frequency_id: selectedFrequency
        })).unwrap();
      }

      // Reload reports after deletion
      await dispatch(listReports({
        location: selectedLocation,
        frequency: selectedFrequency,
        latest_only: "true"
      })).unwrap();

      setDeleteConfirmOpen(false);
      setEntryToDelete(null);

    } catch (err) {
      console.error('Delete error:', err);
      
      const errorMessage = err?.message || 
                          err?.error || 
                          "Delete operation failed. Please try again.";
      
      dispatch(showNotification({
        message: errorMessage,
        type: "error",
      }));
      
      setDeleteConfirmOpen(false);
      setEntryToDelete(null);
    }
  };

  // ----------------------
  // Edit Logic
  // ----------------------
  const handleEditClick = (row) => {
    setEditRow(row);
    setEditModalOpen(true);
  };

  const confirmEditEntry = async () => {
    if (!editRow) return;

    // Validation
    if (!editRow.itemId) {
      dispatch(showNotification({
        message: "Please select an item",
        type: "warning"
      }));
      return;
    }

    if (editRow.currentCount === null || editRow.currentCount === undefined || editRow.currentCount === '') {
      dispatch(showNotification({
        message: "Please enter a current count",
        type: "warning"
      }));
      return;
    }

    const count = Number(editRow.currentCount);
    if (isNaN(count) || count < 0) {
      dispatch(showNotification({
        message: "Current count must be a non-negative number",
        type: "error"
      }));
      return;
    }

    // Validate against par level
    if (editRow.par_level && count > editRow.par_level) {
      dispatch(showNotification({
        message: `Current count (${count}) cannot exceed Par Level (${editRow.par_level})`,
        type: "error"
      }));
      return;
    }

    try {
      await dispatch(
        updateCountEntry({
          id: editRow.id,
          data: {
            item: editRow.itemId,
            on_hand_quantity: count,
            notes: editRow.notes || ''
          }
        })
      ).unwrap();

      // Update local state
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === editRow.id ? { ...row, ...editRow, currentCount: count } : row
        )
      );

      dispatch(showNotification({
        message: `✓ Count for "${editRow.item}" updated successfully`,
        type: "success"
      }));

      setEditConfirmOpen(false);
      setEditModalOpen(false);
      setEditRow(null);

    } catch (err) {
      console.error('Edit error:', err);
      
      const errorMessage = err?.message || 
                          err?.error || 
                          "Update failed. Please try again.";
      
      dispatch(showNotification({
        message: errorMessage,
        type: "error",
      }));
    }
  };

  // ----------------------
  // Table Columns
  // ----------------------
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
          labels={{ red: "Order Needed", yellow: "OK", green: "Over Par" }}
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
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditClick(r)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Entry">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(r)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [dispatch]);

  // ----------------------
  // CSV & Print
  // ----------------------
  const handleDownloadCSV = useCallback(() => {
    try {
      if (!rows || rows.length === 0) {
        dispatch(showNotification({
          message: "No data available to download. Please load a report first.",
          type: "warning"
        }));
        return;
      }
      
      downloadCSVReport(rows, dispatch, showNotification);
    } catch (err) {
      console.error('CSV download error:', err);
      dispatch(showNotification({
        message: "Failed to download CSV. Please try again.",
        type: "error"
      }));
    }
  }, [rows, dispatch]);

  const handlePrint = useCallback(() => {
    try {
      if (!rows || rows.length === 0) {
        dispatch(showNotification({
          message: "No data available to print. Please load a report first.",
          type: "warning"
        }));
        return;
      }
      
      if (!selectedLocation) {
        dispatch(showNotification({
          message: "Please select a location first",
          type: "warning"
        }));
        return;
      }
      
      printReport(
        rows,
        locations,
        selectedLocation,
        username,
        dispatch,
        showNotification
      );
    } catch (err) {
      console.error('Print error:', err);
      dispatch(showNotification({
        message: "Failed to generate print view. Please try again.",
        type: "error"
      }));
    }
  }, [rows, locations, selectedLocation, username, dispatch]);

  // Show loading screen when initial data is being fetched
  if (loading && (!reports || reports.length === 0)) {
    return <AppLoading />;
  }

  return (
    <>
      <ReportsViewUI
        locations={locations}
        frequencies={frequencies}
        availableDates={availableDates}
        selectedLocation={selectedLocation}
        handleDownloadCSV={handleDownloadCSV}
        handlePrint={handlePrint}
        deleteReport={() => handleDeleteClick()} // for full report
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
        sheets={filteredReports || []}
        handleLoadSheets={handleLoadReports}
        loading={loading}
        reportColumns={reportColumns}
        data={rows}
        username={username}
      />

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {entryToDelete?.id
              ? "Are you sure you want to delete this entry? This action cannot be undone."
              : "Are you sure you want to delete the full report? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT FORM DIALOG */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Entry</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Item"
            value={editRow?.itemId || ""}
            onChange={(e) =>
              setEditRow(prev => ({ ...prev, itemId: e.target.value }))
            }
            margin="dense"
            required
            error={editRow && !editRow.itemId}
            helperText={editRow && !editRow.itemId ? "Item is required" : ""}
          >
            <MenuItem value="">— Select Item —</MenuItem>
            {itemsDropdown.map(item => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Vendor"
            value={editRow?.vendor || ""}
            onChange={(e) =>
              setEditRow(prev => ({ ...prev, vendor: e.target.value }))
            }
            margin="dense"
          >
            <MenuItem value="">— No Vendor —</MenuItem>
            {vendorsDropdown.map(v => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Current Count"
            type="number"
            value={editRow?.currentCount ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setEditRow(prev => ({ ...prev, currentCount: value }));
            }}
            margin="dense"
            required
            error={editRow && (editRow.currentCount === null || editRow.currentCount === undefined || editRow.currentCount === '')}
            helperText={
              editRow && (editRow.currentCount === null || editRow.currentCount === undefined || editRow.currentCount === '')
                ? "Current count is required"
                : editRow?.par_level
                ? `Valid range: 0 to ${editRow.par_level}`
                : "Enter the current inventory count"
            }
            InputProps={{ 
              inputProps: { 
                min: 0, 
                max: editRow?.par_level || undefined,
                step: 1 
              } 
            }}
          />

          <TextField
            fullWidth
            label="Notes"
            value={editRow?.notes || ""}
            onChange={(e) =>
              setEditRow(prev => ({ ...prev, notes: e.target.value }))
            }
            margin="dense"
            multiline
            rows={3}
            placeholder="Add any notes or comments..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button
            onClick={() => setEditConfirmOpen(true)}
            variant="contained"
            color="primary"
            disabled={!editRow?.itemId || editRow?.currentCount === null || editRow?.currentCount === undefined || editRow?.currentCount === ''}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT CONFIRM DIALOG */}
      <Dialog open={editConfirmOpen} onClose={() => setEditConfirmOpen(false)}>
        <DialogTitle>Confirm Edit</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save this edit?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmEditEntry} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportsView;

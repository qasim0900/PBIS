import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { Send } from "@mui/icons-material";

import Header from "../components/Header";
import Table from "../components/Table";
import countsAPI from "../services/countsAPI";
import locationsAPI from "../services/locationsAPI";
import { showNotification } from "../store/slices/uiSlice";

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

  // --- State
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch locations
  const fetchLocations = useCallback(async () => {
    try {
      const res = await locationsAPI.getAll();
      const locs = res.data.results || res.data || [];
      setLocations(locs);
      if (locs.length > 0) setSelectedLocation(locs[0].id);
    } catch {
      dispatch(showNotification({ message: "Failed to load locations", type: "error" }));
    }
  }, [dispatch]);

  // --- Fetch sheets
  const fetchSheets = useCallback(async (locationId = null, frequency = null) => {
    setLoading(true);
    try {
      const res = await countsAPI.getSheetsByFrequency(locationId, frequency);
      setSheets(res.data.results || []);
      setSelectedSheet(null);
      setEntries([]);
    } catch {
      dispatch(showNotification({ message: "No sheets found", type: "info" }));
      setSheets([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // --- Fetch entries for a sheet
  const fetchEntries = useCallback(async (sheetId) => {
    try {
      const res = await countsAPI.getEntries(sheetId);
      setEntries(res.data.results || []);
    } catch {
      setEntries([]);
    }
  }, []);

  // --- View sheet
  const viewSheet = useCallback(async (sheet) => {
    setSelectedSheet(sheet);
    setLoading(true);
    await fetchEntries(sheet.id);
    setLoading(false);
  }, [fetchEntries]);

  // --- Submit sheet
  const handleSubmit = useCallback(async () => {
    if (!selectedSheet?.id || selectedSheet.status !== "draft") return;
    setSubmitting(true);
    try {
      await countsAPI.submitSheet(selectedSheet.id);
      dispatch(showNotification({ message: "Sheet submitted!", type: "success" }));
      fetchSheets(selectedLocation, selectedFrequency); // Refresh
    } catch {
      dispatch(showNotification({ message: "Submit failed", type: "error" }));
    } finally {
      setSubmitting(false);
    }
  }, [selectedSheet, selectedLocation, selectedFrequency, dispatch, fetchSheets]);

  // --- Initial load
  useEffect(() => {
    fetchLocations();
    fetchSheets();
  }, [fetchLocations, fetchSheets]);

  // --- Table columns
  const columns = useMemo(() => [
    { header: "Location", accessor: "location.name" },
    { header: "Frequency", accessor: "frequency_display" },
    { header: "Date", accessor: "count_date" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === "submitted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}>
          {row.status_display || row.status}
        </span>
      ),
    },
    { header: "Items", accessor: "entry_count" },
    {
      header: "Action", render: (row) => (
        <Button size="small" variant="outlined" onClick={() => viewSheet(row)}>View</Button>
      )
    },
  ], [viewSheet]);

  // --- Render
  return (
    <Box>
      <Header title="Inventory Counts Overview" subtitle="View all count sheets">
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <TextField
            select label="Location" size="small" value={selectedLocation}
            onChange={(e) => { setSelectedLocation(e.target.value); setSelectedFrequency(""); }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All Locations</MenuItem>
            {locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
          </TextField>

          <TextField
            select label="Frequency" size="small" value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Frequencies</MenuItem>
            {frequencyOptions.map(f => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
          </TextField>

          <Button variant="contained" onClick={() => fetchSheets(selectedLocation, selectedFrequency)}
            disabled={!selectedLocation || !selectedFrequency}>Filter</Button>
          <Button variant="outlined" onClick={() => fetchSheets()}>Show All Latest</Button>
        </Box>
      </Header>

      {loading ? (
        <Card sx={{ p: 8, textAlign: "center" }}><CircularProgress /></Card>
      ) : selectedSheet ? (
        <Box>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">
              {selectedSheet.location.name} • {selectedSheet.frequency_display} • {selectedSheet.count_date}
            </Typography>
            {selectedSheet.status === "draft" && (
              <Button
                variant="contained" color="success" startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                onClick={handleSubmit} disabled={submitting}
              >
                Submit Sheet
              </Button>
            )}
          </Box>
          <Card><CardContent>
            <Table
              columns={[
                { header: "Item", accessor: "item.name" },
                { header: "On Hand", accessor: "on_hand_quantity" },
                { header: "Par", accessor: "par_level" },
                { header: "To Order", accessor: "calculated_qty_to_order" },
                { header: "Status", accessor: "highlight_display" },
              ]}
              data={entries} searchable
            />
          </CardContent></Card>
          <Button sx={{ mt: 2 }} variant="text" onClick={() => setSelectedSheet(null)}>← Back to List</Button>
        </Box>
      ) : (
        <Card><CardContent>
          <Typography variant="h6" gutterBottom>
            {selectedLocation
              ? `Sheets for ${locations.find(l => l.id == selectedLocation)?.name}${selectedFrequency ? " - " + frequencyOptions.find(f => f.value === selectedFrequency)?.label : ""}`
              : "Latest Sheets Across All Locations"
            } ({sheets.length})
          </Typography>
          <Table columns={columns} data={sheets} searchable />
        </CardContent></Card>
      )}
    </Box>
  );
};

export default CountsView;

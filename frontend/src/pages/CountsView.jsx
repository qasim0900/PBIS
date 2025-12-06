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

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");

  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [entries, setEntries] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------
  // 1) Fetch Locations
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // 2) Create + Fetch Sheets for a location/frequency
  // ---------------------------------------------------------
  const fetchSheets = useCallback(async (locationId = null, frequency = null) => {
    if (!locationId || !frequency) {
      setSheets([]);
      return;
    }

    setLoading(true);
    try {
      // FIRST: ensure sheet exists
      await countsAPI.ensureSheet(locationId, frequency);

      // THEN: fetch sheets
      const res = await countsAPI.getSheets(locationId, frequency);
      const data = res.data.results || res.data || [];
      setSheets(data);
    } catch (error) {
      dispatch(showNotification({ message: "No sheets found", type: "info" }));
      setSheets([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // ---------------------------------------------------------
  // 3) Fetch entries of a specific sheet
  // ---------------------------------------------------------
  const fetchEntries = useCallback(async (sheetId) => {
    try {
      const res = await countsAPI.getEntries(sheetId);
      setEntries(res.data.results || res.data || []);
    } catch {
      setEntries([]);
    }
  }, []);

  const viewSheet = useCallback(async (sheet) => {
    setSelectedSheet(sheet);
    setLoading(true);
    await fetchEntries(sheet.id);
    setLoading(false);
  }, [fetchEntries]);

  // ---------------------------------------------------------
  // 4) Submit Sheet
  // ---------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!selectedSheet?.id || selectedSheet.status !== "draft") return;

    setSubmitting(true);
    try {
      await countsAPI.submitSheet(selectedSheet.id);
      dispatch(showNotification({ message: "Sheet submitted!", type: "success" }));

      // Refresh list
      fetchSheets(selectedLocation, selectedFrequency);
      setSelectedSheet(null);

    } catch {
      dispatch(showNotification({ message: "Submit failed", type: "error" }));
    } finally {
      setSubmitting(false);
    }
  }, [selectedSheet, selectedLocation, selectedFrequency, dispatch, fetchSheets]);

  // ---------------------------------------------------------
  // ON LOAD → load locations only
  // ---------------------------------------------------------
  useEffect(() => {
    fetchLocations();

    // Load ALL sheets on initial load
    const loadAllSheets = async () => {
      try {
        const res = await countsAPI.getSheets();   // no filters → ALL data
        const data = res.data.results || res.data || [];
        setSheets(data);
      } catch {
        setSheets([]);
      }
    };

    loadAllSheets();
  }, [fetchLocations]);
  // ---------------------------------------------------------
  // Re-fetch sheets when location or frequency changes
  // ---------------------------------------------------------
  useEffect(() => {
    if (selectedLocation && selectedFrequency) {
      fetchSheets(selectedLocation, selectedFrequency);
    }
  }, [selectedLocation, selectedFrequency, fetchSheets]);

  // ---------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------
  const columns = useMemo(() => [
    { header: "Location", accessor: "location.name" },
    { header: "Frequency", accessor: "frequency_display" },
    { header: "Date", accessor: "count_date" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === "submitted"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
          }`}>
          {row.status_display || row.status}
        </span>
      ),
    },
    { header: "Items", accessor: "entry_count" },
    {
      header: "Action",
      render: (row) => (
        <Button size="small" variant="outlined" onClick={() => viewSheet(row)}>
          View
        </Button>
      ),
    },
  ], [viewSheet]);

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <Box>
      <Header title="Inventory Counts Overview" subtitle="View all count sheets">
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          {/* Location Select */}
          <TextField
            select label="Location" size="small"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedFrequency("");
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Select Location</MenuItem>
            {locations.map((l) => (
              <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
            ))}
          </TextField>

          {/* Frequency Select */}
          <TextField
            select label="Frequency" size="small"
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Select Frequency</MenuItem>
            {frequencyOptions.map(f => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            disabled={!selectedLocation || !selectedFrequency}
            onClick={() => fetchSheets(selectedLocation, selectedFrequency)}
          >
            Load Sheet
          </Button>
        </Box>
      </Header>

      {/* Loading */}
      {loading ? (
        <Card sx={{ p: 8, textAlign: "center" }}>
          <CircularProgress />
        </Card>
      ) : selectedSheet ? (
        <Box>

          {/* Header */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">
              {selectedSheet.location.name} • {selectedSheet.frequency_display} • {selectedSheet.count_date}
            </Typography>

            {selectedSheet.status === "draft" && (
              <Button
                variant="contained" color="success"
                startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                onClick={handleSubmit} disabled={submitting}
              >
                Submit Sheet
              </Button>
            )}
          </Box>

          {/* Entries Table */}
          <Card>
            <CardContent>
              <Table
                columns={[
                  { header: "Item", accessor: "item.name" },
                  { header: "On Hand", accessor: "on_hand_quantity" },
                  { header: "Par", accessor: "par_level" },
                  { header: "To Order", accessor: "calculated_qty_to_order" },
                  { header: "Status", accessor: "highlight_display" },
                ]}
                data={entries}
                searchable
              />
            </CardContent>
          </Card>

          <Button sx={{ mt: 2 }} variant="text" onClick={() => setSelectedSheet(null)}>
            ← Back
          </Button>
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedLocation && selectedFrequency
                ? `Sheets for ${locations.find((l) => l.id == selectedLocation)?.name} - ${frequencyOptions.find((f) => f.value === selectedFrequency)?.label
                }`
                : "No sheet loaded"}
            </Typography>

            <Table columns={columns} data={sheets} searchable />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CountsView;

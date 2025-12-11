import { useEffect, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

import Header from "../components/Header";
import Table from "../components/Table";
import locationsAPI from "../services/locationsAPI";
import countsAPI from "../services/countsAPI";
import { showNotification } from "../store/slices/uiSlice";
import {
  fetchCountSheets,
  fetchCountEntries,
  setSelectedSheet,
  ensureCountSheet,
} from "../store/slices/countsSlice";

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
  const { sheets, entries, selectedSheet, loading } = useSelector((state) => state.counts);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");

  // Fetch Locations (only once)
  const fetchLocations = useCallback(async () => {
    try {
      const res = await locationsAPI.getAll();
      const locs = res.data.results || res.data || [];
      setLocations(locs);

      if (locs.length > 0) {
        setSelectedLocation(locs[0].id);
      }

    } catch {
      dispatch(showNotification({ message: "Failed to load locations", type: "error" }));
    }
  }, [dispatch]);

  // View Sheet Entries
  const viewSheet = useCallback(
    async (sheet) => {
      dispatch(setSelectedSheet(sheet));
      dispatch(fetchCountEntries(sheet.id));
    },
    [dispatch]
  );

  // Submit Sheet
  const handleSubmitSheet = async () => {
    if (!selectedSheet) return;

    try {
      await countsAPI.submitSheet(selectedSheet.id);
      dispatch(showNotification({ message: "Sheet submitted successfully", type: "success" }));
      dispatch(setSelectedSheet(null));

      // Reload sheets
      dispatch(fetchCountSheets({ location: selectedLocation, frequency: selectedFrequency }));

    } catch {
      dispatch(showNotification({ message: "Failed to submit sheet", type: "error" }));
    }
  };

  // Initial load
  useEffect(() => {
    fetchLocations();
    dispatch(fetchCountSheets());
  }, [dispatch, fetchLocations]);

  // Flatten entries for Table
  const flattenedEntries = entries.map((e) => ({
    ...e,
    storage_location: e.override?.storage_location || "",
    counted: e.override?.count || "",
  }));

  // Table columns for sheets
  const columns = useMemo(
    () => [
      { header: "Location", accessor: "location.name" },
      { header: "Frequency", accessor: "frequency_display" },
      { header: "Date", accessor: "count_date" },
      {
        header: "Status",
        accessor: "status",
        render: (row) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${row.status === "submitted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
          >
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
    ],
    [viewSheet]
  );

  return (
    <Box>
      <Header title="Inventory Counts Overview" subtitle="View all count sheets">
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>

          {/* Location Dropdown */}
          <TextField
            select
            label="Location"
            size="small"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedFrequency("");
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Select Location</MenuItem>
            {locations.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Frequency Dropdown */}
          <TextField
            select
            label="Frequency"
            size="small"
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Select Frequency</MenuItem>
            {frequencyOptions.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Load Sheet Button — Only place where API calls happen */}
          <Button
            variant="contained"
            disabled={!selectedLocation || !selectedFrequency}
            onClick={async () => {
              await dispatch(
                ensureCountSheet({
                  locationId: selectedLocation,
                  frequency: selectedFrequency,
                })
              );

              dispatch(
                fetchCountSheets({
                  location: selectedLocation,
                  frequency: selectedFrequency,
                })
              );
            }}
          >
            Load Sheet
          </Button>
        </Box>
      </Header>

      {/* If loading */}
      {loading ? (
        <Card sx={{ p: 8, textAlign: "center" }}>
          <CircularProgress />
        </Card>
      ) : selectedSheet ? (
        // Entries view
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">
              {selectedSheet.location.name} • {selectedSheet.frequency_display} • {selectedSheet.count_date}
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Table
                columns={[
                  { header: "Item", accessor: "item.name" },
                  { header: "On Hand", accessor: "on_hand_quantity" },
                  { header: "Par", accessor: "par_level" },
                  { header: "To Order", accessor: "calculated_qty_to_order" },
                  { header: "Status", accessor: "highlight_display" },
                  { header: "Category", accessor: "item.category_display" },
                  { header: "Storage Location", accessor: "storage_location" },
                  { header: "Counted", accessor: "counted" },
                ]}
                data={flattenedEntries}
                searchable
                rowKey={(row) => `${row.id}-${row.sheet_id}`}
              />
            </CardContent>
          </Card>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            {selectedSheet.status !== "submitted" && (
              <Button variant="contained" onClick={handleSubmitSheet}>
                Submit
              </Button>
            )}
            <Button variant="contained" onClick={() => dispatch(setSelectedSheet(null))}>
              ← Back
            </Button>
          </Box>
        </Box>
      ) : (
        // Sheets list page
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedLocation && selectedFrequency
                ? `Sheets for ${locations.find((l) => l.id == selectedLocation)?.name
                } - ${frequencyOptions.find((f) => f.value === selectedFrequency)?.label
                }`
                : "No sheet loaded"}
            </Typography>

            <Table
              columns={columns}
              data={sheets}
              searchable
              rowKey={(row) => `sheet-${row.id}`}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CountsView;

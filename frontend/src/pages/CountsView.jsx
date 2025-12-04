import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import Header from '../components/Header';
import locationsAPI from '../services/locationsAPI';
import countsAPI from '../services/countsAPI';
import { showNotification } from '../store/slices/uiSlice';
import Table from '../components/Table';

const CountsView = () => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [allSheets, setAllSheets] = useState([]);     // For overview / location-wide
  const [filteredSheets, setFilteredSheets] = useState([]); // For specific frequency
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const frequencyOptions = [
    { label: 'Mon/Wed', value: 'mon_wed' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-Weekly', value: 'bi_weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Semi-Annual', value: 'semi_annual' },
    { label: 'Annual', value: 'annual' },
  ];

  // Fetch all locations
  const fetchLocations = useCallback(async () => {
    try {
      const res = await locationsAPI.getAll();
      const locs = res.data.results || res.data || [];
      setLocations(locs);
      if (locs.length > 0) setSelectedLocation(locs[0].id);
    } catch (err) {
      dispatch(showNotification({ message: 'Failed to load locations', type: 'error' }));
    }
  }, [dispatch]);

  // Fetch entries for a sheet
  const fetchEntries = async (sheetId) => {
    try {
      const res = await countsAPI.getEntries(sheetId);
      setEntries(res.data.results || res.data || []);
    } catch (err) {
      setEntries([]);
    }
  };

  // Load sheet and entries when one is selected
  const viewSheet = async (sheet) => {
    setSelectedSheet(sheet);
    setLoading(true);
    await fetchEntries(sheet.id);
    setLoading(false);
  };

  // 1. Load ALL latest sheets (overview)
  const loadAllLatestSheets = async () => {
    setLoading(true);
    try {
      const res = await countsAPI.getSheetsByFrequency(); // No params = get latest of all
      const sheets = res.data.results || [];
      setAllSheets(sheets);
      setFilteredSheets([]);
      setSelectedSheet(null);
      setEntries([]);
    } catch (err) {
      dispatch(showNotification({ message: 'Failed to load sheets', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // 2. Load sheets for a location (all frequencies)
  const loadSheetsForLocation = async (locationId) => {
    if (!locationId) return;
    setLoading(true);
    try {
      const res = await api.get('/counts/sheets/', {
        params: { location: locationId, ordering: '-count_date' }
      });
      const sheets = res.data.results || [];
      setAllSheets(sheets);
      setFilteredSheets([]);
      setSelectedSheet(null);
      setEntries([]);
    } catch (err) {
      dispatch(showNotification({ message: 'No sheets found', type: 'info' }));
    } finally {
      setLoading(false);
    }
  };

  // 3. Load sheets for location + frequency
  const loadSheetsByLocationAndFrequency = async () => {
    if (!selectedLocation || !selectedFrequency) return;
    setLoading(true);
    try {
      const res = await countsAPI.getSheetsByFrequency(selectedLocation, selectedFrequency);
      const sheets = res.data.results || [];
      setFilteredSheets(sheets);
      setAllSheets([]);
      setSelectedSheet(null);
      setEntries([]);
    } catch (err) {
      dispatch(showNotification({ message: 'No sheets found for this frequency', type: 'info' }));
    } finally {
      setLoading(false);
    }
  };

  // Submit selected sheet
  const handleSubmit = async () => {
    if (!selectedSheet?.id || selectedSheet.status !== 'draft') return;
    setSubmitting(true);
    try {
      await countsAPI.submitSheet(selectedSheet.id);
      dispatch(showNotification({ message: 'Sheet submitted!', type: 'success' }));
      // Refresh current view
      if (selectedFrequency) {
        loadSheetsByLocationAndFrequency();
      } else if (selectedLocation) {
        loadSheetsForLocation(selectedLocation);
      } else {
        loadAllLatestSheets();
      }
    } catch (err) {
      dispatch(showNotification({ message: 'Submit failed', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLocations();
    loadAllLatestSheets();
  }, []);

  // When location changes (but no frequency)
  useEffect(() => {
    if (selectedLocation && !selectedFrequency) {
      loadSheetsForLocation(selectedLocation);
    }
  }, [selectedLocation]);

  const currentSheets = filteredSheets.length > 0 ? filteredSheets : allSheets;

  const columns = [
    { header: 'Location', accessor: 'location.name' },
    { header: 'Frequency', accessor: 'frequency_display', fallback: 'frequency' },
    { header: 'Date', accessor: 'count_date' },
    { header: 'Status', accessor: 'status', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {row.status_display || row.status}
      </span>
    )},
    { header: 'Items', accessor: 'entry_count' },
    {
      header: 'Action',
      render: (row) => (
        <Button size="small" variant="outlined" onClick={() => viewSheet(row)}>
          View
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Header title="Inventory Counts Overview" subtitle="View all count sheets across locations and frequencies">
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <TextField
            select
            label="Location"
            size="small"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedFrequency(''); // Reset frequency
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All Locations</MenuItem>
            {locations.map(loc => (
              <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Frequency"
            size="small"
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Frequencies</MenuItem>
            {frequencyOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={loadSheetsByLocationAndFrequency}
            disabled={!selectedLocation || !selectedFrequency}
          >
            Filter
          </Button>

          <Button variant="outlined" onClick={loadAllLatestSheets}>
            Show All Latest
          </Button>
        </Box>
      </Header>

      {loading ? (
        <Card sx={{ p: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Card>
      ) : selectedSheet ? (
        // Detailed View of One Sheet
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedSheet.location.name} • {selectedSheet.frequency_display} • {selectedSheet.count_date}
            </Typography>
            {selectedSheet.status === 'draft' && (
              <Button
                variant="contained"
                color="success"
                startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                onClick={handleSubmit}
                disabled={submitting}
              >
                Submit Sheet
              </Button>
            )}
          </Box>

          <Card>
            <Box sx={{ p: 2 }}>
              <Table
                columns={[
                  { header: 'Item', accessor: 'item.name' },
                  { header: 'On Hand', accessor: 'on_hand_quantity' },
                  { header: 'Par', accessor: 'par_level' },
                  { header: 'To Order', accessor: 'calculated_qty_to_order' },
                  { header: 'Status', accessor: 'highlight_display' },
                ]}
                data={entries}
                searchable
              />
            </Box>
          </Card>

          <Button sx={{ mt: 2 }} variant="text" onClick={() => setSelectedSheet(null)}>
            ← Back to List
          </Button>
        </Box>
      ) : (
        // Summary Table
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {filteredSheets.length > 0
                ? `Sheets for ${locations.find(l => l.id == selectedLocation)?.name} - ${frequencyOptions.find(f => f.value === selectedFrequency)?.label}`
                : selectedLocation
                  ? `All Sheets for ${locations.find(l => l.id == selectedLocation)?.name}`
                  : 'Latest Sheets Across All Locations'}
              {' '}({currentSheets.length})
            </Typography>

            <Table
              columns={columns}
              data={currentSheets}
              searchable
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CountsView;
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
  InputAdornment,
  Collapse,
} from '@mui/material';
import { Send, LocationOn } from '@mui/icons-material';
import Header from '../components/Header';
import locationsAPI from '../services/locationsAPI';
import countsAPI from '../services/countsAPI';
import { showNotification } from '../store/slices/uiSlice';
import Table from '../components/Table';

const CountsView = () => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [sheetsInRange, setSheetsInRange] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Locations
  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationsAPI.getAll();
      const locs = response.data.results || response.data || [];
      setLocations(locs);
      if (locs.length > 0) setSelectedLocation(locs[0].id);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Fetch Sheet & Entries
  const fetchEntries = useCallback(async (sheetId) => {
    try {
      const response = await countsAPI.getEntries(sheetId, 1, 1000);
      setEntries(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  }, []);

  const fetchSheet = useCallback(async () => {
    if (!selectedLocation || !selectedDate) return;
    setLoading(true);
    try {
      const response = await countsAPI.ensureSheet(selectedLocation, selectedDate);
      setSheet(response.data);
      fetchEntries(response.data.id);
    } catch (error) {
      console.error('Failed to load sheet:', error);
      dispatch(showNotification({
        message: error.response?.data?.detail || 'Failed to load count sheet',
        type: 'error'
      }));
      setSheet(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedDate, dispatch, fetchEntries]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  // Fetch Sheets in Range
  const fetchSheetsInRange = useCallback(async () => {
    if (!selectedLocation || !rangeStart || !rangeEnd || rangeStart > rangeEnd) return;
    setLoading(true);
    try {
      const response = await countsAPI.getSheetsInRange(selectedLocation, rangeStart, rangeEnd);
      setSheetsInRange(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch sheets in range:', error);
      dispatch(showNotification({ message: 'No sheets found in this range', type: 'info' }));
      setSheetsInRange([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, rangeStart, rangeEnd, dispatch]);

  // Submit Sheet
  const handleSubmit = async () => {
    if (!sheet) return;
    setSubmitting(true);
    try {
      await countsAPI.submitSheet(sheet.id);
      dispatch(showNotification({ message: 'Count sheet submitted successfully!', type: 'success' }));
      fetchSheet();
    } catch (error) {
      console.error('Failed to submit count sheet:', error);
      dispatch(showNotification({ message: 'Failed to submit count sheet', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  // Stock Status
  const getStockStatus = (onHand, par) => {
    if (onHand === null || onHand === undefined) return { label: '-', color: 'gray' };
    const ratio = onHand / par;
    if (ratio < 0.25) return { label: 'Critical', color: 'red' };
    if (ratio < 0.5) return { label: 'Low', color: 'orange' };
    return { label: 'OK', color: 'green' };
  };

  // Table Columns
  const columns = [
    { header: 'Item', accessor: 'item.name' },
    { header: 'Category', accessor: 'item.category' },
    { header: 'On Hand', accessor: 'on_hand_quantity' },
    { header: 'Par Level', accessor: 'par_level' },
    { header: 'To Order', accessor: 'calculated_qty_to_order' },
    {
      header: 'Status',
      render: (row) => {
        const status = getStockStatus(row.on_hand_quantity, row.par_level);
        return <span className={`font-semibold`} style={{ color: status.color }}>{status.label}</span>;
      },
    },
  ];

  return (
    <Box>
      <Header
        title="Inventory Counts"
        subtitle="Track and manage your daily inventory counts"
        showRefresh
        onRefresh={fetchSheet}
        sx={{
          '& .MuiToolbar-root': {
            flexDirection: 'column', // always stack main toolbar vertically
            alignItems: 'stretch',
            gap: 1,
          }
        }}
      >
        {/* Controls Container */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>

          {/* Form Fields */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row', md: 'row' },
            gap: { xs: 1, sm: 1.5, md: 3 }, // more space on desktop
            flexWrap: 'wrap',
            alignItems: { xs: 'stretch', sm: 'center' },
          }}>

            {/* Location */}
            <TextField
              select
              size="small"
              value={selectedLocation || ''}
              onChange={(e) => setSelectedLocation(e.target.value)}
              SelectProps={{ displayEmpty: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: {
                  xs: '100%',
                  sm: '25%',
                  md: '25%', // slightly larger on desktop
                },
              }}
            >
              <MenuItem value="" disabled>Select Location</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
              ))}
            </TextField>

            {/* Start Date */}
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 0.5rem)',
                  md: '20%', // wider on desktop
                }
              }}
            />

            {/* End Date */}
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 0.5rem)',
                  md: '20%', // wider on desktop
                }
              }}
            />

            {/* Buttons */}
            <Box sx={{
              display: 'flex',
              gap: { xs: 1, sm: 1.5, md: 2 }, // more space on desktop
              width: { xs: '100%', sm: 'auto', md: 'auto' },
            }}>
              <Button
                variant="contained"
                onClick={fetchSheetsInRange}
                disabled={!selectedLocation || !rangeStart || !rangeEnd || rangeStart > rangeEnd}
                sx={{ py: 1.5, px: 3, fontSize: '1rem' }} // bigger buttons on desktop
              >
                Get
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setRangeStart('');
                  setRangeEnd('');
                  setSheetsInRange([]);
                }}
                sx={{ py: 1.5, px: 3, fontSize: '1rem' }}
              >
                Clear
              </Button>
            </Box>

          </Box>
        </Box>
      </Header>


      {loading ? (
        <Card className="p-4">
          <Typography>Loading...</Typography>
        </Card>
      ) : sheet ? (
        <Collapse in={true}>
          <Box>
            {/* Sheet Info */}
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Card className="bg-purple-600 text-white">
                <CardContent>
                  <Typography variant="overline" className="opacity-80">Status</Typography>
                  <Typography variant="h5" className="capitalize">{sheet.status}</Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Total Items</Typography>
                  <Typography variant="h5" className="text-primary font-semibold">{entries.length}</Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex justify-between items-center">
                  <Box>
                    <Typography variant="overline" color="text.secondary">Action</Typography>
                    <Typography variant="body2">
                      {sheet.status === 'submitted' ? 'Already Submitted' : 'Ready to Submit'}
                    </Typography>
                  </Box>
                  {sheet.status === 'draft' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      Submit
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Entries Table */}
            <Card>
              <div className="p-4">
                <Table
                  columns={columns}
                  data={entries}
                  searchable={true}
                />
              </div>
            </Card>

            {/* Sheets in Range */}
            {sheetsInRange.length > 0 && (
              <Card className="mt-3">
                <CardContent>
                  <Typography variant="h6" className="mb-2">Sheets in Range ({sheetsInRange.length})</Typography>
                  <Table
                    columns={[
                      { header: 'Date', accessor: 'count_date' },
                      { header: 'Status', accessor: 'status' },
                      { header: 'Total Items', accessor: 'entry_count' },
                    ]}
                    data={sheetsInRange}
                    searchable={false}
                    actions={(row) => (
                      <Button size="small" onClick={() => { setSheet(row); fetchEntries(row.id); }}>View</Button>
                    )}
                  />
                </CardContent>
              </Card>
            )}
          </Box>
        </Collapse>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Typography variant="h6" color="text.secondary">
              Select a location and date to view counts
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CountsView;

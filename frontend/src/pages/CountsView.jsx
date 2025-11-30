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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Skeleton,
  Fade,
} from '@mui/material';
import {
  Send,
  Refresh,
  CheckCircle,
  Warning,
  Error,
  Inventory,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import Header from '../components/Header';
import locationsAPI from '../services/locationsAPI';
import countsAPI from '../services/countsAPI';
import { showNotification } from '../store/slices/uiSlice';

const CountsView = () => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  // Range support
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [sheetsInRange, setSheetsInRange] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationsAPI.getAll();
      const locs = response.data.results || response.data || [];
      setLocations(locs);
      if (locs.length > 0) {
        setSelectedLocation(locs[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const fetchEntries = useCallback(async (sheetId, page = 1) => {
    try {
      const response = await countsAPI.getEntries(sheetId, page, pageSize);
      setEntries(response.data.results || response.data || []);
      setTotalEntries(response.data.count || 0);
      setHasNext(Boolean(response.data.next));
      setHasPrev(Boolean(response.data.previous));
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
      setPage(1);
      fetchEntries(response.data.id, 1);
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

  useEffect(() => {
    // whenever page changes, fetch entries for current sheet
    if (sheet && sheet.id) {
      fetchEntries(sheet.id, page);
    }
  }, [page, sheet, fetchEntries]);

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



  const handleUpdateEntry = async (entryId, field, value) => {
    try {
      await countsAPI.updateEntry(entryId, { [field]: value });
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, [field]: value } : e))
      );
    } catch (error) {
      console.error('Failed to update entry:', error);
      dispatch(showNotification({ message: 'Failed to update entry', type: 'error' }));
    }
  };

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

  const getStockStatus = (onHand, par) => {
    if (onHand === null || onHand === undefined) return null;
    const ratio = onHand / par;
    if (ratio < 0.25) return { color: 'error', label: 'Critical', icon: <Error fontSize="small" /> };
    if (ratio < 0.5) return { color: 'warning', label: 'Low', icon: <Warning fontSize="small" /> };
    return { color: 'success', label: 'OK', icon: <CheckCircle fontSize="small" /> };
  };

  return (
    <Box>
      <Header
        title="Inventory Counts"
        subtitle="Track and manage your daily inventory counts"
        showRefresh
        onRefresh={fetchSheet}
      >
        <TextField
          select
          size="small"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        >
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          size="small"
          value={rangeStart}
          onChange={(e) => setRangeStart(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        {/* Range end */}
        <TextField
          type="date"
          size="small"
          value={rangeEnd}
          onChange={(e) => setRangeEnd(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <Button sx={{ ml: 2 }} variant="outlined" onClick={fetchSheetsInRange} disabled={!rangeStart || !rangeEnd || !selectedLocation || rangeStart > rangeEnd}>Fetch Range</Button>
        <Button sx={{ ml: 1 }} variant="text" onClick={() => { setRangeStart(''); setRangeEnd(''); setSheetsInRange([]); }}>Clear Range</Button>
      </Header>

      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : sheet ? (
        <Fade in={true}>
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
              <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="overline" sx={{ opacity: 0.8 }}>Status</Typography>
                  <Typography variant="h5" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {sheet.status}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Total Items</Typography>
                  <Typography variant="h5" fontWeight={600} color="primary">
                    {entries.length}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Pack Size</TableCell>
                      <TableCell align="center">On Hand</TableCell>
                      <TableCell align="center">Par Level</TableCell>
                      <TableCell align="center">To Order</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((entry) => {
                      const status = getStockStatus(entry.on_hand, entry.par_level || 10);
                      return (
                        <TableRow key={entry.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  backgroundColor: 'primary.light',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Inventory sx={{ color: 'primary.main', fontSize: 20 }} />
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {entry.item_name || entry.item?.name || 'Unknown Item'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {entry.category || entry.item?.category || 'General'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={entry.pack_size || entry.item?.pack_size || '1'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              size="small"
                              value={entry.on_hand ?? ''}
                              onChange={(e) => handleUpdateEntry(entry.id, 'on_hand', parseInt(e.target.value) || 0)}
                              disabled={sheet.status === 'submitted'}
                              sx={{ width: 80 }}
                              inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={500}>
                              {entry.par_level || entry.item?.par_level || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              size="small"
                              value={entry.qty_to_order ?? ''}
                              onChange={(e) => handleUpdateEntry(entry.id, 'qty_to_order', parseInt(e.target.value) || 0)}
                              disabled={sheet.status === 'submitted'}
                              sx={{ width: 80 }}
                              inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {status && (
                              <Chip
                                icon={status.icon}
                                label={status.label}
                                color={status.color}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {entries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">
                            No items found for this location
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {entries.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, totalEntries)} of {totalEntries}
                </Typography>
                <Box>
                  <Button variant="outlined" size="small" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!hasPrev} sx={{ mr: 1 }}>
                    Previous
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}>
                    Next
                  </Button>
                </Box>
              </Box>
            </Card>

            {/* If user fetched a range, show sheets list */}
            {sheetsInRange.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Sheets in Range ({sheetsInRange.length})</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">Total Items</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sheetsInRange.map((s) => (
                          <TableRow key={s.id} hover>
                            <TableCell>{s.count_date || s.created_at || 'N/A'}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>{s.status}</TableCell>
                            <TableCell align="center">{s.entry_count || s.total_entries || (s.entries ? s.entries.length : '-')}</TableCell>
                            <TableCell align="right">
                              <Button size="small" onClick={() => { setSheet(s); fetchEntries(s.id); }}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Inventory sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
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
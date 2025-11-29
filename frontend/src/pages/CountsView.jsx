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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sheet, setSheet] = useState(null);
  const [entries, setEntries] = useState([]);
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

  const fetchSheet = useCallback(async () => {
    if (!selectedLocation || !selectedDate) return;
    setLoading(true);
    try {
      const response = await countsAPI.ensureSheet(selectedLocation, selectedDate);
      setSheet(response.data);
      fetchEntries(response.data.id);
    } catch (error) {
      console.error('Failed to fetch sheet:', error);
      setSheet(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedDate]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);





  const fetchEntries = useCallback(async (sheetId) => {
    try {
      const response = await countsAPI.getEntries(sheetId);
      setEntries(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  }, []);

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
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ minWidth: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
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
            </Card>
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

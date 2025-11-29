import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Fade,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  Schedule,
  Code,
} from '@mui/icons-material';
import Header from '../components/Header';
import locationsAPI from '../services/locationsAPI';
import { showNotification } from '../store/slices/uiSlice';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
];

const LocationsView = () => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', timezone: 'America/New_York' });

  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await locationsAPI.update(editingLocation.id, formData);
        dispatch(showNotification({ message: 'Location updated successfully', type: 'success' }));
      } else {
        await locationsAPI.create(formData);
        dispatch(showNotification({ message: 'Location created successfully', type: 'success' }));
      }
      fetchLocations();
      closeModal();
    } catch (error) {
      console.error('Failed to save location:', error);
      dispatch(showNotification({ message: 'Failed to save location', type: 'error' }));
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({ name: location.name, code: location.code, timezone: location.timezone });
    setModalOpen(true);
  };

  const handleDeleteClick = (location) => {
    setDeletingLocation(location);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await locationsAPI.delete(deletingLocation.id);
      dispatch(showNotification({ message: 'Location deleted successfully', type: 'success' }));
      fetchLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
      dispatch(showNotification({ message: 'Failed to delete location', type: 'error' }));
    } finally {
      setDeleteDialogOpen(false);
      setDeletingLocation(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLocation(null);
    setFormData({ name: '', code: '', timezone: 'America/New_York' });
  };

  const getTimezoneLabel = (tz) => TIMEZONES.find(t => t.value === tz)?.label || tz;

  return (
    <Box>
      <Header 
        title="Locations" 
        subtitle={`Manage your store locations (${locations.length} total)`}
        showRefresh
        onRefresh={fetchLocations}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Add Location
        </Button>
      </Header>

      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Fade in={true}>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Timezone</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <LocationOn />
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {location.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Code fontSize="small" />}
                          label={location.code}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Schedule fontSize="small" />}
                          label={getTimezoneLabel(location.timezone)}
                          size="small"
                          sx={{ backgroundColor: 'info.light', color: 'info.dark' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(location)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteClick(location)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {locations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No locations yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add your first location to get started
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>
      )}

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Location Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                placeholder="e.g., Syracuse Store"
              />
              <TextField
                label="Location Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                fullWidth
                placeholder="e.g., SYR"
                inputProps={{ maxLength: 10 }}
              />
              <TextField
                select
                label="Timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                fullWidth
              >
                {TIMEZONES.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeModal} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{editingLocation ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingLocation?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationsView;

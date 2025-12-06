import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  Skeleton,
  Collapse,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add, LocationOn, Schedule, Code, Close } from '@mui/icons-material';

import Header from '../components/Header';
import CustomTable from '../components/Table';
import locationsAPI from '../services/locationsAPI';
import { showNotification } from '../store/slices/uiSlice';

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
];

const useLocations = () => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data.results || response.data || []);
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to fetch locations', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, loading, fetchLocations };
};

const getTimezoneLabel = (tz) => TIMEZONES.find((t) => t.value === tz)?.label || tz;

const LocationsView = () => {
  const dispatch = useDispatch();
  const { locations, loading, fetchLocations } = useLocations();

  const [open, setOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', timezone: 'America/New_York' });

  const handleOpen = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({ name: location.name, code: location.code, timezone: location.timezone });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', code: '', timezone: 'America/New_York' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingLocation(null);
    setFormData({ name: '', code: '', timezone: 'America/New_York' });
  };

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
      await fetchLocations();
      handleClose();
    } catch (error) {
      console.error(error);
      dispatch(showNotification({ message: 'Failed to save location', type: 'error' }));
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Location',
      accessor: 'name',
      render: ({ name }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <LocationOn />
          </Avatar>
          <Typography variant="subtitle2" fontWeight={600}>{name}</Typography>
        </Box>
      ),
    },
    {
      header: 'Code',
      accessor: 'code',
      render: ({ code }) => <Chip icon={<Code fontSize="small" />} label={code} size="small" variant="outlined" />,
    },
    {
      header: 'Timezone',
      accessor: 'timezone',
      render: ({ timezone }) => (
        <Chip
          icon={<Schedule fontSize="small" />}
          label={getTimezoneLabel(timezone)}
          size="small"
          sx={{ backgroundColor: 'info.light', color: 'info.dark' }}
        />
      ),
    },
  ], []);

  return (
    <Box>
      <Header
        title="Locations"
        subtitle={`Manage your store locations (${locations.length})`}
        showRefresh
        onRefresh={fetchLocations}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Add Location
        </Button>
      </Header>

      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Collapse in>
          <CustomTable
            columns={columns}
            data={locations}
            actions={(row) => (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleOpen(row)}
                sx={{ minWidth: 80 }}
              >
                Edit
              </Button>
            )}
          />
        </Collapse>
      )}

      {/* MUI Dialog - Custom Modal replaced */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLocation ? 'Edit Location' : 'Add New Location'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Location Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                placeholder="e.g., Syracuse Store"
                autoFocus
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
                {TIMEZONES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingLocation ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LocationsView;
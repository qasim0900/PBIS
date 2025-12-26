import { showNotification } from '../uiSlice';
import LocationsDesign from './LocationsDesign.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { fetchLocations, createLocation, updateLocation } from './locationsSlice';

const DEFAULT_FORM = {
  name: '',
  code: '',
  timezone: 'America/New_York',
};

const Locations = () => {
  const dispatch = useDispatch();
  const { locations, loading } = useSelector((state) => state.locations);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const openDialog = useCallback((location = null) => {
    setEditing(location);
    setFormData(location ?? DEFAULT_FORM);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  }, []);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await dispatch(updateLocation({ id: editing.id, data: formData })).unwrap();
        dispatch(showNotification({ message: 'Location updated', type: 'success' }));
      } else {
        await dispatch(createLocation(formData)).unwrap();
        dispatch(showNotification({ message: 'Location created', type: 'success' }));
      }
      closeDialog();
      dispatch(fetchLocations());
    } catch {
      dispatch(showNotification({ message: 'Save failed', type: 'error' }));
    }
  };

  return (
    <LocationsDesign
      locations={locations}
      loading={loading}
      open={open}
      editing={editing}
      formData={formData}
      setFormData={setFormData}
      openDialog={openDialog}
      closeDialog={closeDialog}
      handleSubmit={handleSubmit}
    />
  );
};

export default Locations;
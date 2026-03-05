import LocationsDesign from './LocationsDesign.jsx';
import AppLoading from '../../components/AppLoading';
import { showNotification } from '../../api/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { fetchFrequencies } from '../FrequencyView/frequencySlice.js';
import { fetchLocations, createLocation, updateLocation } from './locationsSlice';


//---------------------------------------
// :: Default Form Data
//---------------------------------------

/*
Defines the default form structure for creating or editing a location
*/

const DEFAULT_FORM = {
  frequency: '',
  name: '',
  code: '',
  timezone: 'America/New_York',
};


//---------------------------------------
// :: Locations Component
//---------------------------------------

const Locations = () => {
  const dispatch = useDispatch();
  const { locations, loading } = useSelector((state) => state.locations);
  const { frequencies } = useSelector((state) => state.frequencies);


  //---------------------------------------
  // :: Local State
  //---------------------------------------

  /*
  Controls dialog visibility, editing mode, and form data
  */

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);


  //---------------------------------------
  // :: Initial Fetch
  //---------------------------------------

  /*
  Fetches locations and frequency options on component mount
  */

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchFrequencies());
  }, [dispatch]);


  //---------------------------------------
  // :: Dialog Handlers
  //---------------------------------------

  /*
  openDialog: Opens the create/edit dialog and sets formData
  closeDialog: Resets formData and closes dialog
  */

  const openDialog = useCallback((location = null) => {
    setEditing(location);
    setFormData(
      location
        ? { ...location, frequency: location.frequency_id?.id || '' }
        : DEFAULT_FORM
    );
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  }, []);


  //---------------------------------------
  // :: Submit Handler
  //---------------------------------------

  /*
  Validates form data and dispatches create or update actions
  Shows notifications for success/failure
  Refetches locations after successful operation
  */

  const handleSubmit = useCallback(async () => {
    if (!formData.frequency) {
      dispatch(
        showNotification({ message: 'Please select a Inventory List', type: 'error' })
      );
      return;
    }

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
      dispatch(showNotification({ message: 'Unable to save location. Please try again.', type: 'error' }));
    }
  }, [dispatch, editing, formData, closeDialog]);


  //---------------------------------------
  // :: Render
  //---------------------------------------
  /*
  Passes data, form state, and handlers to LocationsDesign component
  */

  // Show loading screen when initial data is being fetched
  if (loading && locations.length === 0) {
    return <AppLoading />;
  }

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
      frequencies={frequencies}
    />
  );
};

export default Locations;

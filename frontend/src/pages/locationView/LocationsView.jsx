import LocationsDesign from './LocationsDesign.jsx';
import AppLoading from '../../components/AppLoading';
import { showNotification } from '../../api/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { fetchLocations, createLocation, updateLocation } from './locationsSlice';


//---------------------------------------
// :: Default Form Data
//---------------------------------------

/*
Defines the default form structure for creating or editing a location
*/

const DEFAULT_FORM = {
  name: '',
  description: '',
  is_active: true
};


//---------------------------------------
// :: Locations Component
//---------------------------------------

const Locations = () => {
  const dispatch = useDispatch();
  const { locations, loading } = useSelector((state) => state.locations);


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
    dispatch(fetchLocations())
      .unwrap()
      .catch((err) => {
        console.error('Fetch locations error:', err);
        const errorMessage = err?.message ||
          err?.detail ||
          'Failed to load locations. Please refresh the page.';
        dispatch(showNotification({
          message: errorMessage,
          type: 'error'
        }));
      });

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
      location ? { ...location } : DEFAULT_FORM
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
    // Comprehensive validation
    if (!formData.name || !formData.name.trim()) {
      dispatch(showNotification({
        message: 'Location name is required',
        type: 'error'
      }));
      return;
    }

    if (formData.name.trim().length < 2) {
      dispatch(showNotification({
        message: 'Location name must be at least 2 characters long',
        type: 'error'
      }));
      return;
    }

    if (formData.name.trim().length > 255) {
      dispatch(showNotification({
        message: 'Location name must be 255 characters or less',
        type: 'error'
      }));
      return;
    }

    const cleanPayload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      is_active: formData.is_active
    };

    try {
      if (editing) {
        await dispatch(updateLocation({ id: editing.id, data: cleanPayload })).unwrap();
        dispatch(showNotification({
          message: `✓ Location "${cleanPayload.name}" updated successfully`,
          type: 'success'
        }));
      } else {
        await dispatch(createLocation(cleanPayload)).unwrap();
        dispatch(showNotification({
          message: `✓ Location "${cleanPayload.name}" created successfully`,
          type: 'success'
        }));
      }
      closeDialog();
      dispatch(fetchLocations());
    } catch (err) {
      console.error('Location save error:', err);

      // Handle field-specific errors
      if (err.fieldErrors) {
        const errorMessages = Object.entries(err.fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');

        dispatch(showNotification({
          message: errorMessages || 'Validation failed',
          type: 'error'
        }));
      } else {
        // Handle general errors
        const errorMessage =
          err?.message ||
          err?.name?.[0] ||
          err?.detail ||
          'Unable to save location. Please try again.';

        dispatch(showNotification({
          message: errorMessage,
          type: 'error'
        }));
      }
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
    />
  );
};

export default Locations;

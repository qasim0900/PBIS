import VendorDesign from './VendorDesign.jsx';
import AppLoading from '../../components/AppLoading';
import { showNotification } from '../../api/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { fetchVendors, createVendor, updateVendor } from './VendorSlice';


//---------------------------------------
// :: Default Form Data
//---------------------------------------

/*
Initial structure for vendor form fields.
Used for both create and edit operations.
*/

const DEFAULT_FORM = {
  name: '',
  color: '#6366F1',
  contact_person: '',
  phone: '',
  email: '',
  notes: '',
};

//---------------------------------------
// :: VendorView Component
//---------------------------------------

const VendorView = () => {
  const dispatch = useDispatch();
  const { vendors, loading } = useSelector((state) => state.vendors);


  //---------------------------------------
  // :: Local State
  //---------------------------------------

  /*
  Controls dialog visibility, editing state, and form data
  */

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);


  //---------------------------------------
  // :: Initial Fetch Vendors
  //---------------------------------------

  /*
  Dispatches fetchVendors thunk on component mount
  */

  useEffect(() => {
    dispatch(fetchVendors())
      .unwrap()
      .catch((err) => {
        console.error('Fetch vendors error:', err);
        const errorMessage = err?.message || 
                            err?.detail || 
                            'Failed to load vendors. Please refresh the page.';
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
  openDialog: Opens create/edit dialog and populates formData
  closeDialog: Resets formData and closes dialog
  */

  const openDialog = useCallback((vendor = null) => {
    setEditing(vendor);
    setFormData(vendor ?? DEFAULT_FORM);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  }, []);



  //---------------------------------------
  // :: Form Submit Handler
  //---------------------------------------

  /*
  Validates form data and dispatches create or update actions
  Shows notifications for success/failure
  */

  const handleSubmit = async () => {
    // Comprehensive validation
    if (!formData.name || !formData.name.trim()) {
      dispatch(showNotification({ 
        message: 'Vendor name is required', 
        type: 'error' 
      }));
      return;
    }

    if (formData.name.trim().length < 2) {
      dispatch(showNotification({ 
        message: 'Vendor name must be at least 2 characters long', 
        type: 'error' 
      }));
      return;
    }

    if (formData.name.trim().length > 255) {
      dispatch(showNotification({ 
        message: 'Vendor name must be 255 characters or less', 
        type: 'error' 
      }));
      return;
    }

    // Email validation
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        dispatch(showNotification({ 
          message: 'Please enter a valid email address', 
          type: 'error' 
        }));
        return;
      }
    }

    // Color validation
    if (formData.color && formData.color.trim()) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(formData.color.trim())) {
        dispatch(showNotification({ 
          message: 'Color must be a valid hex code (e.g., #6B5B95)', 
          type: 'error' 
        }));
        return;
      }
    }

    const cleanPayload = {
      name: formData.name.trim(),
      color: formData.color?.trim() || '#6B5B95',
      contact_person: formData.contact_person?.trim() || '',
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || '',
      notes: formData.notes?.trim() || '',
    };

    try {
      if (editing) {
        await dispatch(updateVendor({ id: editing.id, data: cleanPayload })).unwrap();
        dispatch(showNotification({ 
          message: `✓ Vendor "${cleanPayload.name}" updated successfully`, 
          type: 'success' 
        }));
      } else {
        await dispatch(createVendor(cleanPayload)).unwrap();
        dispatch(showNotification({ 
          message: `✓ Vendor "${cleanPayload.name}" created successfully`, 
          type: 'success' 
        }));
      }

      closeDialog();
    } catch (err) {
      console.error('Vendor save error:', err);
      
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
          'Unable to save vendor. Please try again.';
        
        dispatch(showNotification({
          message: errorMessage,
          type: 'error'
        }));
      }
    }
  };


  //---------------------------------------
  // :: Render
  //---------------------------------------
  /*
  Passes data, form state, and handlers to VendorDesign component
  */

  // Show loading screen when initial data is being fetched
  if (loading && vendors.length === 0) {
    return <AppLoading />;
  }

  return (
    <VendorDesign
      vendors={vendors}
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

export default VendorView;

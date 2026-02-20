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
    dispatch(fetchVendors());
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
    if (!formData.name.trim()) {
      dispatch(showNotification({ message: 'Vendor name is required', type: 'error' }));
      return;
    }

    try {
      if (editing) {
        await dispatch(updateVendor({ id: editing.id, data: formData })).unwrap();
        dispatch(showNotification({ message: 'Vendor updated successfully', type: 'success' }));
      } else {
        await dispatch(createVendor(formData)).unwrap();
        dispatch(showNotification({ message: 'Vendor created successfully', type: 'success' }));
      }

      closeDialog();
    } catch {
      dispatch(showNotification({ message: 'Unable to save vendor. Please try again.', type: 'error' }));
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

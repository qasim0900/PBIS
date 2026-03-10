import BrandDesign from './BrandDesign.jsx';
import AppLoading from '../../components/AppLoading';
import { showNotification } from '../../api/uiSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { fetchBrands, createBrand, updateBrand } from './BrandSlice';
import { fetchVendors } from '../VendorView/VendorSlice';

//---------------------------------------
// :: Default Form Data
//---------------------------------------
const DEFAULT_FORM = {
  name: '',
  description: '',
  vendor: '',
};

//---------------------------------------
// :: BrandView Component
//---------------------------------------
const BrandView = () => {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const { vendors } = useSelector((state) => state.vendors);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  //---------------------------------------
  // :: Initial Fetch
  //---------------------------------------
  useEffect(() => {
    dispatch(fetchBrands())
      .unwrap()
      .catch((err) => {
        console.error('Fetch brands error:', err);
        const errorMessage = err?.message || 
                            err?.detail || 
                            'Failed to load brands. Please refresh the page.';
        dispatch(showNotification({ 
          message: errorMessage, 
          type: 'error' 
        }));
      });
    
    dispatch(fetchVendors())
      .unwrap()
      .catch((err) => {
        console.error('Fetch vendors error:', err);
        dispatch(showNotification({ 
          message: 'Failed to load vendors', 
          type: 'warning' 
        }));
      });
  }, [dispatch]);

  //---------------------------------------
  // :: Dialog Handlers
  //---------------------------------------
  const openDialog = useCallback((brand = null) => {
    setEditing(brand);
    setFormData(brand ? {
      name: brand.name,
      description: brand.description || '',
      vendor: brand.vendor || '',
    } : DEFAULT_FORM);
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
  const handleSubmit = async () => {
    // Comprehensive validation
    if (!formData.name || !formData.name.trim()) {
      dispatch(showNotification({ 
        message: 'Brand name is required', 
        type: 'error' 
      }));
      return;
    }

    if (formData.name.trim().length < 2) {
      dispatch(showNotification({ 
        message: 'Brand name must be at least 2 characters long', 
        type: 'error' 
      }));
      return;
    }

    if (formData.name.trim().length > 100) {
      dispatch(showNotification({ 
        message: 'Brand name must be 100 characters or less', 
        type: 'error' 
      }));
      return;
    }

    if (!formData.vendor) {
      dispatch(showNotification({ 
        message: 'Vendor is required', 
        type: 'error' 
      }));
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      vendor: formData.vendor,
    };

    try {
      if (editing) {
        await dispatch(updateBrand({ id: editing.id, data: payload })).unwrap();
        dispatch(showNotification({ 
          message: `✓ Brand "${payload.name}" updated successfully`, 
          type: 'success' 
        }));
      } else {
        await dispatch(createBrand(payload)).unwrap();
        dispatch(showNotification({ 
          message: `✓ Brand "${payload.name}" added successfully`, 
          type: 'success' 
        }));
      }

      closeDialog();
    } catch (err) {
      console.error('Brand save error:', err);
      
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
          err?.vendor?.[0] ||
          err?.detail ||
          'Unable to save brand. Please try again.';
        
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

  // Show loading screen when initial data is being fetched
  if (loading && brands.length === 0) {
    return <AppLoading />;
  }

  return (
    <BrandDesign
      brands={brands}
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

export default BrandView;

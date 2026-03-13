import { useEffect, useState } from 'react';
import CatalogDesign from './CatalogDesign.jsx';
import AppLoading from '../../components/AppLoading.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../api/uiSlice.js';
import { fetchBrands } from '../BrandView/BrandSlice.js';
import { fetchVendors } from '../VendorView/VendorSlice.js';
import { fetchLocations } from '../locationView/locationsSlice.js';
import { fetchFrequencies } from '../FrequencyView/frequencySlice.js';
import { AnimatePresence } from 'framer-motion';
import { selectIsAdmin } from '../loginView/authSlice.js';
import {
  fetchAllItems,
  createItem,
  updateItem,
  clearCurrentItem,
  setCurrentItem,
} from './catalogSlice.js';


//-----------------------------------
// :: Catalog View Function
//-----------------------------------

const CatalogView = () => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { vendors } = useSelector((state) => state.vendors);
  const { locations } = useSelector((state) => state.locations);
  const { frequencies } = useSelector((state) => state.frequencies);
  const { brands } = useSelector((state) => state.brands);
  const { items, currentItem, loading } = useSelector((state) => state.inventory);
  const isAdmin = useSelector(selectIsAdmin);


  //-----------------------------------
  // :: Empty Form
  //-----------------------------------

  const emptyForm = {
    name: '',
    category: 'other',
    count_unit: '',
    order_unit: '',
    pack_size: 1,
    location: null,
    vendor: null,
    brand: null,
    default_vendor: null,
    par_level: 1,
    order_point: 1,
    frequency: '',
    notes: '',
    storage_location: '',
    is_active: true,
  };
  const [formData, setFormData] = useState(emptyForm);


  //-----------------------------------
  // :: useEffect Dispatch Slice
  //-----------------------------------

  useEffect(() => {
    dispatch(fetchAllItems())
      .unwrap()
      .catch((err) => {
        console.error('Fetch items error:', err);
        const errorMessage = err?.message || 
                            err?.detail || 
                            'Failed to load inventory items. Please refresh the page.';
        dispatch(showNotification({ 
          message: errorMessage, 
          type: 'error' 
        }));
      });
    
    dispatch(fetchLocations())
      .unwrap()
      .catch((err) => {
        console.error('Fetch locations error:', err);
      });
    
    dispatch(fetchVendors())
      .unwrap()
      .catch((err) => {
        console.error('Fetch vendors error:', err);
      });
    
    dispatch(fetchFrequencies())
      .unwrap()
      .catch((err) => {
        console.error('Fetch frequencies error:', err);
      });
    
    dispatch(fetchBrands())
      .unwrap()
      .catch((err) => {
        console.error('Fetch brands error:', err);
      });
  }, [dispatch]);


  //-----------------------------------
  // :: Field Label Mapping
  //-----------------------------------

  const fieldLabels = {
    name: 'Item Name',
    category: 'Category',
    count_unit: 'Count Unit',
    order_unit: 'Order Unit',
    pack_size: 'Pack Size',
    location: 'Location',
    vendor: 'Vendor',
    brand: 'Brand',
    par_level: 'Par Level',
    order_point: 'Order Point',
    frequency: 'Inventory List',
    storage_location: 'Storage Location',
    notes: 'Notes',
  };


  //-----------------------------------
  // :: Form Validation
  //-----------------------------------

  const validateForm = () => {
    const errors = {};
    
    // Required field validation
    const requiredFields = [
      'name', 'category', 'count_unit', 'order_unit', 
      'pack_size', 'location', 'par_level', 'order_point', 'frequency'
    ];

    requiredFields.forEach(field => {
      const value = formData[field];
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'number' && isNaN(value))) {
        errors[field] = `${fieldLabels[field]} is required`;
      }
    });

    // Numeric validation
    if (formData.pack_size && (formData.pack_size < 1 || !Number.isInteger(Number(formData.pack_size)))) {
      errors.pack_size = 'Pack Size must be a positive whole number';
    }

    if (formData.par_level && formData.par_level < 0) {
      errors.par_level = 'Par Level cannot be negative';
    }

    if (formData.order_point && formData.order_point < 0) {
      errors.order_point = 'Order Point cannot be negative';
    }

    // Business logic validation
    if (formData.order_point && formData.par_level && 
        Number(formData.order_point) > Number(formData.par_level)) {
      errors.order_point = 'Order Point should not exceed Par Level';
    }

    // String length validation
    if (formData.name && formData.name.length > 200) {
      errors.name = 'Item Name must be 200 characters or less';
    }

    if (formData.count_unit && formData.count_unit.length > 50) {
      errors.count_unit = 'Count Unit must be 50 characters or less';
    }

    if (formData.order_unit && formData.order_unit.length > 50) {
      errors.order_unit = 'Order Unit must be 50 characters or less';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n');
      dispatch(
        showNotification({
          message: `Please fix the following errors:\n${errorMessages}`,
          type: 'error',
        })
      );
      return false;
    }

    return true;
  };


  //-----------------------------------
  // :: Open Modal Function
  //-----------------------------------

  const openAddModal = () => {
    dispatch(clearCurrentItem());
    setFieldErrors({});
    setFormData(prev => ({
      ...emptyForm,
      location: locations?.[0]?.id || null,
    }));
    setModalOpen(true);
  };


  //-----------------------------------
  // :: open Edit Modal Function
  //-----------------------------------

  const openEditModal = (item) => {
    dispatch(setCurrentItem(item));
    setFieldErrors({});
    setFormData({
      name: item.name || '',
      category: item.category || 'other',
      count_unit: item.count_unit || '',
      order_unit: item.order_unit || '',
      pack_size: item.pack_size || 1,
      location: item.location || null,
      vendor: item.vendor || null,
      brand: item.brand || null,
      default_vendor: item.default_vendor || item.vendor || null,
      par_level: item.par_level || 1,
      order_point: item.order_point || 1,
      frequency: item.frequency || '',
      notes: item.notes || '',
      storage_location: item.storage_location || '',
      is_active: item.is_active !== undefined ? item.is_active : true,
    });
    setModalOpen(true);
  };


  //-----------------------------------
  // :: handle Save Function
  //-----------------------------------

  const handleSave = async () => {
    // Clear previous errors
    setFieldErrors({});
    
    // Frontend validation
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Clean payload: convert empty strings to null for optional fields
      const payload = {
        ...formData,
        vendor: formData.vendor || null,
        brand: formData.brand || null,
        default_vendor: formData.vendor || null,
        notes: formData.notes || '',
        storage_location: formData.storage_location || '',
        pack_size: Number(formData.pack_size),
        par_level: Number(formData.par_level),
        order_point: Number(formData.order_point),
      };

      let result;
      if (currentItem) {
        result = await dispatch(updateItem({ id: currentItem.id, data: payload })).unwrap();
        dispatch(showNotification({ 
          message: `✓ ${result.name} updated successfully`, 
          type: 'success' 
        }));
      } else {
        result = await dispatch(createItem(payload)).unwrap();
        dispatch(showNotification({ 
          message: `✓ ${result.name} added to inventory`, 
          type: 'success' 
        }));
      }
      
      setModalOpen(false);
      setFieldErrors({});
      dispatch(fetchAllItems());
      
    } catch (error) {
      console.error('Save failed:', error);
      
      // Handle field-specific errors from backend
      if (error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
        
        // Create user-friendly error message
        const errorList = Object.entries(error.fieldErrors)
          .map(([field, message]) => `• ${fieldLabels[field] || field}: ${message}`)
          .join('\n');
        
        dispatch(showNotification({ 
          message: `Validation Error:\n${errorList}`, 
          type: 'error' 
        }));
      } else if (error.message) {
        dispatch(showNotification({ 
          message: error.message, 
          type: 'error' 
        }));
      } else {
        // Generic error message
        const action = currentItem ? 'update' : 'create';
        dispatch(showNotification({ 
          message: `Failed to ${action} item. Please check your connection and try again.`, 
          type: 'error' 
        }));
      }
    } finally {
      setSaving(false);
    }
  };


  //-----------------------------------
  // :: Handle Form Change with Validation
  //-----------------------------------

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };


  //-----------------------------------
  // :: Return Code
  //-----------------------------------

  // Show loading screen when initial data is being fetched
  if (loading && items.length === 0) {
    return <AppLoading />;
  }

  return (
    <AnimatePresence mode="wait">
      <CatalogDesign
        items={items}
        loading={loading}
        modalOpen={modalOpen}
        formData={formData}
        setFormData={handleFormChange}
        setModalOpen={setModalOpen}
        openAddModal={openAddModal}
        openEditModal={openEditModal}
        frequencies={frequencies}
        handleSave={handleSave}
        saving={saving}
        currentItem={currentItem}
        locations={locations}
        vendors={vendors}
        brands={brands}
        fieldErrors={fieldErrors}
        isAdmin={isAdmin}
      />
    </AnimatePresence>
  );
};


//-----------------------------------
// :: Export CatalogView
//-----------------------------------

export default CatalogView;

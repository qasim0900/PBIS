import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../api/uiSlice.js';
import {
  fetchAllItems,
  createItem,
  updateItem,
  clearCurrentItem,
  setCurrentItem,
} from './catalogSlice.js';
import { fetchLocations } from '../locationView/locationsSlice.js';
import { fetchVendors } from '../VendorView/VendorSlice.js';
import { fetchFrequencies } from '../FrequencyView/frequencySlice.js';
import CatalogDesign from './CatalogDesign.jsx';

const CatalogView = () => {
  const dispatch = useDispatch();

  const { items, currentItem, loading } = useSelector((state) => state.inventory);
  const { locations } = useSelector((state) => state.locations);
  const { vendors } = useSelector((state) => state.vendors);
  const { frequencies } = useSelector((state) => state.frequencies);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: '',
    category: 'fruit',
    count_unit: '',
    order_unit: '',
    pack_size: 1,
    location: null,
    vendor: null,
    default_vendor: null,
    frequency: null,
    par_level: 1,
    order_point: 1,
    storage_location: '',
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchAllItems());
    dispatch(fetchLocations());
    dispatch(fetchVendors());
    dispatch(fetchFrequencies());
  }, [dispatch]);

  /* ================= ADD ================= */
  const openAddModal = () => {
    dispatch(clearCurrentItem());
    setFormData(prev => ({
      ...emptyForm,
      location: locations?.[0]?.id || null,
      vendor: vendors?.[0]?.id || null,
      default_vendor: vendors?.[0]?.id || null,
      frequency: frequencies?.[0]?.id || null,
    }));
    setModalOpen(true);
  };

  /* ================= EDIT ================= */
  const openEditModal = (item) => {
    dispatch(setCurrentItem(item));
    setFormData({
      name: item.name,
      category: item.category,
      count_unit: item.count_unit,
      order_unit: item.order_unit,
      pack_size: item.pack_size,
      location: item.location,
      vendor: item.vendor,
      default_vendor: item.default_vendor || item.vendor,
      frequency: item.frequency,
      par_level: item.par_level,
      order_point: item.order_point,
      storage_location: item.storage_location,
      is_active: item.is_active,
    });
    setModalOpen(true);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    // Ensure required fields
    if (!formData.name || !formData.location || !formData.vendor || !formData.frequency) {
      dispatch(showNotification({
        message: 'Name, Location, Vendor & Frequency are required',
        type: 'error',
      }));
      return;
    }

    setSaving(true);
    try {
      // Create a copy and set default_vendor automatically
      const payload = {
        ...formData,
        default_vendor: formData.vendor,
      };

      if (currentItem) {
        await dispatch(updateItem({ id: currentItem.id, data: payload })).unwrap();
        dispatch(showNotification({ message: 'Item updated', type: 'success' }));
      } else {
        await dispatch(createItem(payload)).unwrap();
        dispatch(showNotification({ message: 'Item created', type: 'success' }));
      }

      setModalOpen(false);
      dispatch(fetchAllItems());
    } catch {
      dispatch(showNotification({ message: 'Save failed', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CatalogDesign
      items={items}
      loading={loading}
      modalOpen={modalOpen}
      formData={formData}
      setFormData={setFormData}
      setModalOpen={setModalOpen}
      openAddModal={openAddModal}
      openEditModal={openEditModal}
      handleSave={handleSave}
      saving={saving}
      currentItem={currentItem}
      locations={locations}
      vendors={vendors}
      frequencies={frequencies}
    />
  );
};

export default CatalogView;

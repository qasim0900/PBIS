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
  const { vendors } = useSelector((state) => state.vendors);
  const { locations } = useSelector((state) => state.locations);
  const { frequencies } = useSelector((state) => state.frequencies);
  const { brands } = useSelector((state) => state.brands);
  const { items, currentItem, loading } = useSelector((state) => state.inventory);


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
    is_active: true,
  };
  const [formData, setFormData] = useState(emptyForm);


  //-----------------------------------
  // :: useEffect Dispatch Slice
  //-----------------------------------

  useEffect(() => {
    dispatch(fetchAllItems());
    dispatch(fetchLocations());
    dispatch(fetchVendors());
    dispatch(fetchFrequencies());
    dispatch(fetchBrands());
  }, [dispatch]);


  //-----------------------------------
  // :: Form Validation
  //-----------------------------------

  const validateForm = () => {
    const requiredFields = [
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "count_unit", label: "Count Unit" },
      { key: "order_unit", label: "Order Unit" },
      { key: "pack_size", label: "Pack Size" },
      { key: "location", label: "Location" },
      { key: "vendor", label: "Vendor" },
      { key: "brand", label: "Brand" },
      { key: "par_level", label: "Par Level" },
      { key: "order_point", label: "Order Point" },
      { key: "frequency", label: "Inventory List" },
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        formData[field.key] === null ||
        formData[field.key] === undefined ||
        formData[field.key] === "" ||
        (typeof formData[field.key] === "number" && isNaN(formData[field.key]))
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((f) => f.label).join(", ");
      dispatch(
        showNotification({
          message: `Required fields missing: ${fieldNames}. Please complete the form to proceed.`,
          type: "error",
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
    setFormData(prev => ({
      ...emptyForm,
      location: locations?.[0]?.id || null,
      vendor: vendors?.[0]?.id || null,
      default_vendor: vendors?.[0]?.id || null,
      brand: brands?.[0]?.id || null,
    }));
    setModalOpen(true);
  };


  //-----------------------------------
  // :: open Edit Modal Function
  //-----------------------------------

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
      brand: item.brand,
      default_vendor: item.default_vendor || item.vendor,
      par_level: item.par_level,
      order_point: item.order_point,
      frequency_name: item.frequency_name,
      notes: item.notes || '',
      is_active: item.is_active,
    });
    setModalOpen(true);
  };


  //-----------------------------------
  // :: handle Save Function
  //-----------------------------------

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        default_vendor: formData.vendor,
      };

      if (currentItem) {
        await dispatch(updateItem({ id: currentItem.id, data: payload })).unwrap();
        dispatch(showNotification({ message: 'Catalog entry successfully updated.', type: 'success' }));
      } else {
        await dispatch(createItem(payload)).unwrap();
        dispatch(showNotification({ message: 'New catalog entry successfully created.', type: 'success' }));
      }
      setModalOpen(false);
      dispatch(fetchAllItems());
    } catch {
      dispatch(showNotification({ message: 'Persistence failed. Please verify your entries and try again.', type: 'error' }));
    } finally {
      setSaving(false);
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
        setFormData={setFormData}
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
      />
    </AnimatePresence>
  );
};


//-----------------------------------
// :: Export CatalogView
//-----------------------------------

export default CatalogView;

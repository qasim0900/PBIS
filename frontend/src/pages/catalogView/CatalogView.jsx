import { useEffect, useState } from 'react';
import CatalogDesign from './CatalogDesign.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../api/uiSlice.js';
import { fetchVendors } from '../VendorView/VendorSlice.js';
import { fetchLocations } from '../locationView/locationsSlice.js';
import { fetchFrequencies } from '../FrequencyView/frequencySlice.js';
import { fetchBrands } from '../BrandView/BrandSlice.js';
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

/*
This component connects the inventory UI to Redux by fetching required data,
managing modal form state, and handling create/update 
operations before passing everything to the CatalogDesign component.
*/

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

  /*
  This code defines an emptyForm object that provides default values for all inventory item fields, 
  used to initialise or reset the add/edit form
  */

  const emptyForm = {
    name: 'apple',
    category: 'fruit',
    count_unit: '',
    order_unit: '',
    pack_size: 1,
    location: null,
    vendor: null,
    brand: null,
    default_vendor: null,
    frequency: null,
    par_level: 1,
    order_point: 1,
    storage_location: '',
    is_active: true,
  };
  const [formData, setFormData] = useState(emptyForm);


  //-----------------------------------
  // :: useEffect Dispatch Slice
  //-----------------------------------

  /*
  his useEffect automatically fetches inventory items, locations, vendors, and frequencies when 
  the component mounts by dispatching the relevant Redux actions.
  */

  useEffect(() => {
    dispatch(fetchAllItems());
    dispatch(fetchLocations());
    dispatch(fetchVendors());
    dispatch(fetchFrequencies());
    dispatch(fetchBrands());
  }, [dispatch]);




  //-----------------------------------
  // :: Open Modal Function
  //-----------------------------------

  /*
  This function prepares and opens the "Add Item" modal by clearing the current item, resetting the 
  form with default values, and setting the modal state to open.
  */

  const openAddModal = () => {
    dispatch(clearCurrentItem());
    setFormData(prev => ({
      ...emptyForm,
      location: locations?.[0]?.id || null,
      vendor: vendors?.[0]?.id || null,
      default_vendor: vendors?.[0]?.id || null,
      frequency: frequencies?.[0]?.id || null,
      brand: brands?.[0]?.id || null,
    }));
    setModalOpen(true);
  };



  //-----------------------------------
  // :: open Edit Modal Function
  //-----------------------------------

  /*
  This function opens the edit modal by setting the selected item as the current item and 
  populating the form with its existing values
  */

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
      frequency: item.frequency,
      par_level: item.par_level,
      order_point: item.order_point,
      storage_location: item.storage_location,
      is_active: item.is_active,
    });
    setModalOpen(true);
  };



  //-----------------------------------
  // :: handle Save Function
  //-----------------------------------

  /*
  This function validates the form, then creates or updates an inventory item via Redux actions, displays 
  success/error notifications, and refreshes the item list.
  */

  const handleSave = async () => {
    if (!formData.name || !formData.location || !formData.vendor || !formData.frequency) {
      dispatch(showNotification({
        message: 'Name, Location, Vendor & Frequency are required',
        type: 'error',
      }));
      return;
    }
    setSaving(true);
    try {
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


  //-----------------------------------
  // :: Return Code
  //-----------------------------------

  /*
  This code renders the CatalogDesign component, passing in inventory data, 
  modal state, form handlers, and lookup lists as props
  */

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
      brands={brands}
      frequencies={frequencies}
    />
  );
};


//-----------------------------------
// :: Export CatalogView
//-----------------------------------

/*
This line exports the CatalogView component as the default export from the file, allowing 
it to be imported and used elsewhere in the application.
*/

export default CatalogView;

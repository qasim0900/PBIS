import { useEffect, useState } from 'react';
import { showNotification } from '../uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllItems,
  createItem,
  updateItem,
  clearCurrentItem,
  setCurrentItem,
} from './catalogSlice';
import CatalogDesign from './CatalogDesign.jsx';

const CatalogView = () => {
  const dispatch = useDispatch();
  const { items, currentItem } = useSelector((state) => state.catalog);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'fruit',
    count_unit: 'bags',
    order_unit: 'cases',
    pack_size: 1,
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  const openAddModal = () => {
    dispatch(clearCurrentItem());
    setFormData({
      name: '',
      category: 'fruit',
      count_unit: 'bags',
      order_unit: 'cases',
      pack_size: 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    dispatch(setCurrentItem(item));
    setFormData({
      name: item.name,
      category: item.category,
      count_unit: item.count_unit,
      order_unit: item.order_unit,
      pack_size: item.pack_size || 1,
      is_active: item.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      dispatch(showNotification({ message: 'Item name is required!', type: 'error' }));
      return;
    }

    setSaving(true);
    try {
      if (currentItem) {
        await dispatch(updateItem({ id: currentItem.id, data: formData })).unwrap();
        dispatch(showNotification({ message: 'Item updated successfully!', type: 'success' }));
      } else {
        await dispatch(createItem(formData)).unwrap();
        dispatch(showNotification({ message: 'Item added successfully!', type: 'success' }));
      }
      setModalOpen(false);
      dispatch(fetchAllItems());
    } catch (error) {
      const msg = error.name?.[0] || 'Failed to save item';
      dispatch(showNotification({ message: msg, type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CatalogDesign
      items={items}
      modalOpen={modalOpen}
      formData={formData}
      setFormData={setFormData}
      setModalOpen={setModalOpen}
      openAddModal={openAddModal}
      openEditModal={openEditModal}
      handleSave={handleSave}
      saving={saving}
      currentItem={currentItem}
    />
  );
};

export default CatalogView;

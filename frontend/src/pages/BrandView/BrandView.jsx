import BrandDesign from './BrandDesign.jsx';
import { showNotification } from '../../api/uiSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { fetchBrands, createBrand, updateBrand } from './BrandSlice';

//---------------------------------------
// :: Default Form Data
//---------------------------------------
const DEFAULT_FORM = {
  name: '',
  description: '',
};

//---------------------------------------
// :: BrandView Component
//---------------------------------------
const BrandView = () => {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  //---------------------------------------
  // :: Initial Fetch Brands
  //---------------------------------------
  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  //---------------------------------------
  // :: Dialog Handlers
  //---------------------------------------
  const openDialog = useCallback((brand = null) => {
    setEditing(brand);
    setFormData(brand ?? DEFAULT_FORM);
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
    if (!formData.name.trim()) {
      dispatch(showNotification({ message: 'Brand name is required', type: 'error' }));
      return;
    }


    const payload = {
      name: formData.name,
      description: formData.description || '',
    };

    try {
      if (editing) {
        await dispatch(updateBrand({ id: editing.id, data: payload })).unwrap();
        dispatch(showNotification({ message: 'Brand updated successfully', type: 'success' }));
      } else {
        await dispatch(createBrand(payload)).unwrap();
        dispatch(showNotification({ message: 'Brand added successfully', type: 'success' }));
      }

      closeDialog();
    } catch {
      dispatch(showNotification({ message: 'Save failed', type: 'error' }));
    }
  };

  //---------------------------------------
  // :: Render
  //---------------------------------------
  return (
    <BrandDesign
      brands={brands}
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

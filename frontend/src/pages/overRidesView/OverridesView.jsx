import { showNotification } from '../uiSlice';
import OverridesViewUI from './OverridesViewUI';
import catalogAPI from '../catalogView/catalogAPI';
import { useDispatch, useSelector } from 'react-redux';
import locationsAPI from '../locationView/locationsAPI';
import { useEffect, useCallback, useState } from 'react';
import {
  fetchOverrides,
  createOverride,
  updateOverride,
  setSelectedLocation,
} from './overrideSlice';




const DEFAULT_FORM = {
  catalog_item: '',
  location_id: '',
  par_level: 10,
  order_point: 5,
  count_frequency: 'weekly',
  storage_location: '',
  min_order_qty: 1,
  count: 1,
  is_active: true,
  vendor_name: '',
};




const OverridesView = () => {
  const dispatch = useDispatch();
  const { items, loading, selectedLocation } = useSelector((state) => state.overrides);
  const [locations, setLocations] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    locationsAPI.getAll().then(({ data }) => {
      const list = data?.results ?? [];
      setLocations(list);
      if (!selectedLocation && list.length > 0) {
        dispatch(setSelectedLocation(list[0].id));
      }
    });

    catalogAPI.getAll().then(({ data }) => {
      setCatalogItems(data?.results ?? []);
    });
  }, [dispatch, selectedLocation]);


  useEffect(() => {
    if (selectedLocation) {
      dispatch(fetchOverrides(selectedLocation));
    }
  }, [dispatch, selectedLocation]);

  const openDialog = useCallback(
    (row = null) => {
      setEditing(row);
      setFormData(
        row
          ? {
            ...DEFAULT_FORM,
            ...row,
            catalog_item: row.item_id,
            location_id: row.location_id,
            count_frequency: row.frequency,
          }
          : { ...DEFAULT_FORM, location_id: selectedLocation }
      );
      setOpen(true);
    },
    [selectedLocation]
  );

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        location_id: Number(formData.location_id),
        item_id: Number(formData.catalog_item),
      };

      if (editing) {
        await dispatch(updateOverride({ id: editing.id, payload })).unwrap();
        dispatch(showNotification({ message: 'Override updated successfully', type: 'success' }));
      } else {
        await dispatch(createOverride(payload)).unwrap();
        dispatch(showNotification({ message: 'Override created successfully', type: 'success' }));
      }

      dispatch(fetchOverrides(selectedLocation));
      closeDialog();
    } catch (err) {
      dispatch(showNotification({ message: 'Failed to save override', type: 'error' }));
    }
  };

  return (
    <OverridesViewUI
      items={items}
      loading={loading}
      locations={locations}
      catalogItems={catalogItems}
      open={open}
      editing={editing}
      formData={formData}
      onChangeFormData={setFormData}
      onOpenDialog={openDialog}
      onCloseDialog={closeDialog}
      onSubmit={handleSubmit}
    />
  );
};

export default OverridesView;
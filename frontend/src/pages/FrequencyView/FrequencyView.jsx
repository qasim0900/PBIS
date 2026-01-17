import FrequencyDesign from './FrequencyDesign.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../api/uiSlice.js';
import { useEffect, useState, useCallback } from 'react';
import { fetchFrequencies, createFrequency, updateFrequency } from './frequencySlice.js';

//---------------------------------------
// :: Default Form Data
//---------------------------------------
/*
Defines the default structure for creating/editing a frequency
*/
const DEFAULT_FORM = {
  name: '',
  code: '',
  period_type: 'weekly',
  allowed_weekdays: [],
  description: '',
};

//---------------------------------------
// :: FrequencyView Component
//---------------------------------------
const FrequencyView = () => {
  const dispatch = useDispatch();
  const { frequencies, loading } = useSelector((state) => state.frequencies);

  //---------------------------------------
  // :: Local State
  //---------------------------------------
  /*
  Controls dialog visibility, editing mode, and form data
  */
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  //---------------------------------------
  // :: Initial Fetch
  //---------------------------------------
  /*
  Fetch frequencies on component mount
  */
  useEffect(() => {
    dispatch(fetchFrequencies());
  }, [dispatch]);

  //---------------------------------------
  // :: Dialog Handlers
  //---------------------------------------
  /*
  openDialog: Opens create/edit dialog and sets formData
  closeDialog: Resets formData and closes dialog
  */
  const openDialog = useCallback((frequency = null) => {
    setEditing(frequency);
    setFormData(
      frequency
        ? {
          name: frequency.name,
          code: frequency.code,
          period_type: frequency.period_type,
          allowed_weekdays: frequency.allowed_weekdays || [],
          description: frequency.description || '',
        }
        : DEFAULT_FORM
    );
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  }, []);

  //---------------------------------------
  // :: Submit Handler
  //---------------------------------------
  /*
  Validates formData and dispatches create/update actions
  Displays notifications for success/failure
  Refetches frequencies after successful operation
  */
  const handleSubmit = useCallback(async () => {
    const { recurrence_type, start_day, end_day } = formData;
    if (!recurrence_type && !(start_day && end_day)) {
      return dispatch(
        showNotification({
          message: 'Either Recurrence Type or Start/End Day must be selected',
          type: 'error',
        })
      );
    }

    if ((start_day && !end_day) || (!start_day && end_day)) {
      return dispatch(
        showNotification({
          message: start_day ? 'Please select an End Day' : 'Please select a Start Day',
          type: 'error',
        })
      );
    }

    try {
      if (editing) {
        await dispatch(updateFrequency({ id: editing.id, data: formData })).unwrap();
        dispatch(showNotification({ message: 'Frequency updated successfully', type: 'success' }));
      } else {
        await dispatch(createFrequency(formData)).unwrap();
        dispatch(showNotification({ message: 'Frequency created successfully', type: 'success' }));
      }

      closeDialog();
      dispatch(fetchFrequencies());
    } catch {
      dispatch(showNotification({ message: 'Save failed', type: 'error' }));
    }
  }, [dispatch, editing, formData, closeDialog]);

  //---------------------------------------
  // :: Render
  //---------------------------------------

  /*
  Passes state, form data, and handlers to FrequencyDesign component
  */

  return (
    <FrequencyDesign
      frequencies={frequencies}
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

export default FrequencyView;

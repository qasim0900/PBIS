import FrequencyDesign from './FrequencyDesign.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../api/uiSlice.js';
import { useEffect, useState, useCallback } from 'react';
import { fetchFrequencies, createFrequency, updateFrequency } from './frequencySlice.js';


//---------------------------------------
// :: DEFAULT_FORM List
//---------------------------------------


/*
Defines the default form values for creating or editing a frequency entry.
*/

const DEFAULT_FORM = {
  frequency_name: '',
  description: '',
};


//---------------------------------------
// :: FrequencyView Function
//---------------------------------------

/*
Manages frequency data by fetching, creating, and updating frequency records, and passes state to the FrequencyDesign UI.
*/

const FrequencyView = () => {
  const dispatch = useDispatch();
  const { frequencies, loading } = useSelector((state) => state.frequencies);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);


  //---------------------------------------
  // :: useEffect Dispatch Function
  //---------------------------------------

  /*
  Fetches frequency data from the server when the component mounts.
  */

  useEffect(() => {
    dispatch(fetchFrequencies());
  }, [dispatch]);


  //---------------------------------------
  // :: openDialog Function
  //---------------------------------------

  /*
  Opens the dialog and sets form data for editing if a frequency is provided, otherwise loads default form values.
  */

  const openDialog = useCallback((frequency = null) => {
    setEditing(frequency);
    setFormData(
      frequency
        ? {
          frequency_name: frequency.frequency_name || '',
          description: frequency.description || '',
        }
        : DEFAULT_FORM
    );
    setOpen(true);
  }, []);


  //---------------------------------------
  // :: closeDialog Function
  //---------------------------------------

  /*
  Closes the dialog, resets editing state, and clears the form to default values.
  */

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setFormData(DEFAULT_FORM);
  }, []);


  //---------------------------------------
  // :: handleSubmit Function
  //---------------------------------------

  /*
  Saves a new or existing frequency, shows a notification, refreshes the list, and closes the dialog
  */

  const handleSubmit = useCallback(async (payload) => {
    try {
      if (editing) {
        await dispatch(updateFrequency({ id: editing.id, data: payload })).unwrap();
        dispatch(showNotification({ message: 'Inventory List updated successfully', type: 'success' }));
      } else {
        await dispatch(createFrequency(payload)).unwrap();
        dispatch(showNotification({ message: 'Inventory List created successfully', type: 'success' }));
      }
      closeDialog();
      dispatch(fetchFrequencies());
    } catch {
      dispatch(showNotification({ message: 'Unable to save Inventory List. Please try again.', type: 'error' }));
    }
  }, [dispatch, editing, closeDialog]);


  //---------------------------------------
  // :: Return Code
  //---------------------------------------


  /*
  Passing state and handlers from the container to the FrequencyDesign component for rendering.
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


//---------------------------------------
// :: Export FrequencyView
//---------------------------------------

/*
A container component that manages frequency data and actions, then renders the `FrequencyDesign` UI.
*/

export default FrequencyView;

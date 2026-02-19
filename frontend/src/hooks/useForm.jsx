import { useState, useCallback } from 'react';


//---------------------------------------
// :: Manage State and inputs
//---------------------------------------

/*
Custom hook to manage form state, handle input changes, and submit asynchronously.
*/

/**
 * Custom hook for form state management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Async submit handler
 */

//---------------------------------------
// :: Use Form Function
//---------------------------------------

/*
`Custom hook to manage form state, handle changes, validation, and async submission.`
*/

export const useForm = (initialValues = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  //---------------------------------------
  // :: Handle Change Function
  //---------------------------------------

  /*
  Handles form field changes, including checkboxes, and updates the corresponding state.
  */

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);


  //---------------------------------------
  // :: Handle Blur Function
  //---------------------------------------

  /*
  `Marks a form field as touched on blur to track user interaction.`
  */

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);


  //---------------------------------------
  // :: Handle Submit Function
  //---------------------------------------

  /*
  `Handles form submission, calls the async onSubmit callback, and manages the submitting state.`
  */

  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      setIsSubmitting(true);
      try {
        if (onSubmit) await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );


  //---------------------------------------
  // :: Reset Form Function
  //---------------------------------------

  /*
  `Resets the form to its initial values, clearing touched fields and errors.`
  */

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  }, [initialValues]);


  //---------------------------------------
  // :: Set Field Value Function
  //---------------------------------------

  /*
  `Programmatically sets the value of a single form field.`
  */

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  `Exposes the complete form state and handlers for easy form management.`
  */

  return {
    values,
    touched,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues,
    setErrors,
    setTouched,
  };
};


//---------------------------------------
// :: Export Use Form
//---------------------------------------

/*
`Exports the useForm hook for managing form state and handling submissions.`
*/

export default useForm;

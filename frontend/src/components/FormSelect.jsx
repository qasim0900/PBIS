import { memo } from 'react';
import { TextField, MenuItem } from '@mui/material';


//---------------------------------------
// :: React Select component
//---------------------------------------

/*
A reusable React Select component built with Material-UI TextField that 
supports custom options, value, change handling, error display, helper text, and disabled state.
*/

/**
 * Reusable Select Component
 * 
 * @param {string} name - The name of the select field
 * @param {string} label - Label text for the select
 * @param {any} value - Current value of the select
 * @param {function} onChange - Change handler
 * @param {Array<{value: any, label: string}>} options - Array of options
 * @param {boolean} error - Error state
 * @param {string} helperText - Helper or error text
 * @param {boolean} disabled - Disabled state
 * @param {object} props - Additional props to spread onto TextField
 */


//---------------------------------------
// :: Form Select Function
//---------------------------------------

/*
A compact, reusable Material-UI select component that renders a 
labeled dropdown with customizable options, value, error handling, helper text, and disabled state.
*/

const FormSelect = ({
  name,
  label,
  value,
  onChange,
  options = [],
  error = false,
  helperText = '',
  disabled = false,
  ...props
}) => {

  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  A Material-UI `TextField` configured as a select dropdown with a placeholder, dynamic options,
   error handling, helper text, and optional disabled state.
  */

  return (
    <TextField
      select
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      disabled={disabled}
      size="small"
      {...props}
    >
      <MenuItem value="" disabled>
        Select {label}
      </MenuItem>
      {options.map(({ value: optionValue, label: optionLabel }) => (
        <MenuItem key={optionValue} value={optionValue}>
          {optionLabel}
        </MenuItem>
      ))}
    </TextField>
  );
};


//---------------------------------------
// :: Export Memo Form Select
//---------------------------------------

/*
Exports the FormSelect component wrapped in React.memo to optimise rendering by preventing unnecessary re-renders.
*/

export default memo(FormSelect);

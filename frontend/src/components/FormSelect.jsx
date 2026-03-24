import { memo } from 'react';
import { TextField, MenuItem } from '@mui/material';

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

export default memo(FormSelect);

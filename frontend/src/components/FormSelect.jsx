import { TextField, MenuItem } from '@mui/material';

export const FormSelect = ({
  name,
  label,
  value,
  onChange,
  options = [],
  error = false,
  helperText = '',
  disabled = false,
  ...props
}) => (
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
    <MenuItem value="">Select {label}</MenuItem>
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

export default FormSelect;

import { useState, useEffect } from 'react';
import { 
  TextField, 
  MenuItem, 
  CircularProgress,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUnits } from "../../pages/catalogView/unitsSlice.js";
import { MotionBox, fadeInVariants } from "../MotionComponents.jsx";

/**
 * UnitSelect Component
 * 
 * A reusable dropdown component for selecting units from the backend API.
 * Features:
 * - Fetches units from backend API
 * - Shows loading state while fetching
 * - Displays unit name with quantity (e.g., "Case (12 items)")
 * - Supports required validation
 * - Integrates with Redux for state management
 */
const UnitSelect = ({ 
  value, 
  onChange, 
  required = false, 
  label = "Unit",
  helperText,
  error,
  ...props 
}) => {
  const dispatch = useDispatch();
  const { units, loading, error: unitsError } = useSelector((state) => state.units);

  useEffect(() => {
    dispatch(fetchAllUnits());
  }, [dispatch]);

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  if (loading && units.length === 0) {
    return (
      <MotionBox
        component={Box}
        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <TextField
          label={label}
          value=""
          disabled
          fullWidth
          variant="outlined"
          helperText="Loading units..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(107, 70, 193, 0.04)',
            },
          }}
          {...props}
        />
        <CircularProgress 
          size={20} 
          thickness={4}
          sx={{ color: 'primary.main' }}
        />
      </MotionBox>
    );
  }

  if (unitsError) {
    return (
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <TextField
          label={label}
          value=""
          error
          fullWidth
          variant="outlined"
          helperText="Failed to load units"
          disabled
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
              borderColor: 'error.main',
            },
          }}
          {...props}
        />
      </MotionBox>
    );
  }

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      <TextField
        select
        label={label}
        value={value || ''}
        onChange={handleChange}
        required={required}
        error={error || !!unitsError}
        helperText={helperText || (unitsError ? 'Failed to load units' : '')}
        fullWidth
        variant="outlined"
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: '0 8px 25px rgba(107, 70, 193, 0.15)',
                border: '1px solid rgba(107, 70, 193, 0.1)',
              },
            },
          },
        }}
        {...props}
      >
        <MenuItem value="">
          <em>Select a unit...</em>
        </MenuItem>
        {units.map((unit) => (
          <MenuItem 
            key={unit.id} 
            value={unit.id}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(107, 70, 193, 0.08)',
              },
            }}
          >
            <Box>
              <Typography variant="body1" fontWeight={500}>
                {unit.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {unit.quantity} items per {unit.name.toLowerCase()}
                {unit.description && ` • ${unit.description}`}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        {units.length === 0 && !loading && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No units available. Please create units first.
            </Typography>
          </MenuItem>
        )}
      </TextField>
    </MotionBox>
  );
};

export default UnitSelect;

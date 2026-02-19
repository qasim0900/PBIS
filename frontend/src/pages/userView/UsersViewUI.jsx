import React, { useEffect } from 'react';
import { Person, AdminPanelSettings, SupervisedUserCircle, Close } from '@mui/icons-material';
import { Box, Button, Select, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';

// User roles with icons and colors
export const ROLES = [
  { value: 'admin', label: 'Admin', color: 'error', icon: <AdminPanelSettings /> },
  { value: 'manager', label: 'Manager', color: 'primary', icon: <SupervisedUserCircle /> },
  { value: 'staff', label: 'Staff', color: 'default', icon: <Person /> },
];

// Stats cards for dashboard display
export const getStatsCards = ({ total, admins, managers, staff }) => [
  { label: 'Total Users', value: total, gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', textColor: 'white' },
  { label: 'Admins', value: admins, textColor: 'error.main' },
  { label: 'Managers', value: managers, textColor: 'primary.main' },
  { label: 'Staff', value: staff, textColor: 'text.secondary' },
];

//---------------------------------------
// :: UserDialog Component
//---------------------------------------
// Modal dialog for adding/updating users with validation and error feedback.

export const UserDialog = ({ open, onClose, onSubmit, formData, setFormData, selectedUser }) => {
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    const handleClick = () => setErrors({});
    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);
  }, []);
  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!selectedUser) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) onSubmit(e);
  };

  return (
    <Dialog open={open} disableEnforceFocus={false}
      aria-labelledby="user-dialog-title" onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ position: 'relative' }}>
        {selectedUser ? 'Edit User' : 'Add New User'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: theme => theme.palette.grey[500] }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Username"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              error={!!errors.username}
              helperText={errors.username}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              required
              fullWidth
            />
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                {ROLES.map(r => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.icon}<Box component="span" sx={{ ml: 1 }}>{r.label}</Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
            </FormControl>

            {!selectedUser && (
              <>
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  fullWidth
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required
                  fullWidth
                />
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained">{selectedUser ? 'Update' : 'Create'} User</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

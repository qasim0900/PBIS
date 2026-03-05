import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Person, AdminPanelSettings, SupervisedUserCircle, Close } from '@mui/icons-material';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, FormHelperText, Select } from '@mui/material';

const scaleIn = { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', duration: 0.3 } };

export const ROLES = [
  { value: 'admin', label: 'Admin', color: 'error', icon: <AdminPanelSettings /> },
  { value: 'manager', label: 'Manager', color: 'primary', icon: <SupervisedUserCircle /> },
  { value: 'staff', label: 'Staff', color: 'default', icon: <Person /> },
];

export const getStatsCards = ({ total, admins, managers, staff }) => [
  { label: 'Total Users', value: total, gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', textColor: 'white' },
  { label: 'Admins', value: admins, textColor: 'error.main' },
  { label: 'Managers', value: managers, textColor: 'primary.main' },
  { label: 'Staff', value: staff, textColor: 'text.secondary' },
];

export const UserDialog = ({ open, onClose, onSubmit, formData, setFormData, selectedUser }) => {
  const [errors, setErrors] = React.useState({});
  
  useEffect(() => {
    const handleClick = () => setErrors({});
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          <motion.div {...scaleIn}>
            <DialogTitle className="flex items-center justify-between">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </span>
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit} noValidate>
              <DialogContent dividers className="space-y-4 pt-4">
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
                        <Box className="flex items-center gap-2">
                          {r.icon}
                          <span>{r.label}</span>
                        </Box>
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
              </DialogContent>

              <DialogActions className="p-4">
                <Button onClick={onClose}>Cancel</Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" variant="contained">
                    {selectedUser ? 'Update' : 'Create'} User
                  </Button>
                </motion.div>
              </DialogActions>
            </form>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};


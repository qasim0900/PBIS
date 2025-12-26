import { Person, AdminPanelSettings, SupervisedUserCircle, Close } from '@mui/icons-material';
import { Box, Button, Select, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel } from '@mui/material';

export const ROLES = [
  { value: 'admin', label: 'Admin', color: 'error', icon: <AdminPanelSettings /> },
  { value: 'manager', label: 'Manager', color: 'primary', icon: <SupervisedUserCircle /> },
  { value: 'staff', label: 'Staff', color: 'default', icon: <Person /> },
];

export const getStatsCards = (stats) => [
  {
    label: 'Total Users',
    value: stats.total,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    textColor: 'white',
  },
  {
    label: 'Admins',
    value: stats.admins,
    textColor: 'error.main',
  },
  {
    label: 'Managers',
    value: stats.managers,
    textColor: 'primary.main',
  },
  {
    label: 'Staff',
    value: stats.staff,
    textColor: 'text.secondary',
  },
];

export const UserDialog = ({ open, onClose, onSubmit, formData, setFormData, selectedUser }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      {selectedUser ? 'Edit User' : 'Add New User'}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
      >
        <Close />
      </IconButton>
    </DialogTitle>

    <form onSubmit={onSubmit}>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {ROLES.map(({ value, label, icon }) => (
                <MenuItem key={value} value={value}>
                  {icon} <Box component="span" sx={{ ml: 1 }}>{label}</Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!selectedUser && (
            <>
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

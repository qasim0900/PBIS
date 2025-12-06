import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar, Skeleton,
  Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { Add, Edit, Person, AdminPanelSettings, SupervisedUserCircle, PersonOff, CheckCircle, Close } from '@mui/icons-material';

import Header from '../components/Header';
import Table from '../components/Table';
import { showNotification } from '../store/slices/uiSlice';
import { fetchUsers, createUser, updateUser } from '../store/slices/usersSlice';

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'error', icon: <AdminPanelSettings /> },
  { value: 'manager', label: 'Manager', color: 'primary', icon: <SupervisedUserCircle /> },
  { value: 'staff', label: 'Staff', color: 'default', icon: <Person /> },
];

const UsersView = () => {
  const dispatch = useDispatch();
  const { users = [], loading } = useSelector((state) => state.users);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null); // <-- track editing user
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'staff',
    password: '',
    confirmPassword: ''
  });

  const openDialog = (user = null) => {
    if (user) {
      setIsEdit(true);
      setEditingUserId(user.id);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: ''
      });
    } else {
      setIsEdit(false);
      setEditingUserId(null);
      setFormData({
        username: '',
        email: '',
        role: 'staff',
        password: '',
        confirmPassword: ''
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setIsEdit(false);
    setEditingUserId(null);
    setFormData({
      username: '',
      email: '',
      role: 'staff',
      password: '',
      confirmPassword: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && formData.password !== formData.confirmPassword) {
      dispatch(showNotification({ message: 'Passwords do not match', type: 'error' }));
      return;
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      ...(isEdit ? {} : { password: formData.password })
    };

    try {
      if (isEdit) {
        await dispatch(updateUser({ id: editingUserId, data: payload })).unwrap();
        dispatch(showNotification({ message: 'User updated successfully', type: 'success' }));
      } else {
        await dispatch(createUser(payload)).unwrap();
        dispatch(showNotification({ message: 'User created successfully', type: 'success' }));
      }
      closeDialog();
    } catch (err) {
      dispatch(showNotification({ message: err.message || 'Operation failed', type: 'error' }));
    }
  };

  const toggleUserStatus = useCallback(async (user) => {
    try {
      await dispatch(updateUser({ id: user.id, data: { is_active: !user.is_active } })).unwrap();
      dispatch(showNotification({ message: 'Status updated', type: 'success' }));
    } catch {
      dispatch(showNotification({ message: 'Failed to update status', type: 'error' }));
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    staff: users.filter(u => u.role === 'staff').length,
  }), [users]);

  const getRoleInfo = useCallback(role => ROLES.find(r => r.value === role) || ROLES[2], []);
  const getInitials = useCallback(name => name?.slice(0, 2).toUpperCase() || 'U', []);

  const columns = useMemo(() => [
    {
      header: 'User',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: row.is_active ? 1 : 0.5 }}>
          <Avatar sx={{ bgcolor: `${getRoleInfo(row.role).color}.main`, opacity: row.is_active ? 1 : 0.4 }}>
            {getInitials(row.username)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: row.is_active ? 'text.primary' : 'text.disabled' }}>
              {row.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">{row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      header: 'Role',
      render: (row) => {
        const role = getRoleInfo(row.role);
        return <Chip icon={role.icon} label={role.label} size="small" color={role.color} variant="outlined" />;
      }
    },
    {
      header: 'Status',
      render: (row) => (
        <Chip
          icon={row.is_active ? <CheckCircle /> : <PersonOff />}
          label={row.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={row.is_active ? 'success' : 'default'}
          variant={row.is_active ? 'filled' : 'outlined'}
        />
      )
    }
  ], [getRoleInfo, getInitials]);

  return (
    <Box>
      <Header title="User Management" subtitle="Manage user accounts and permissions">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openDialog()}
          sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Add User
        </Button>
      </Header>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>Total Users</Typography>
            <Typography variant="h3" fontWeight={700}>{stats.total}</Typography>
          </CardContent>
        </Card>
        <Card><CardContent><Typography variant="overline" color="text.secondary">Admins</Typography><Typography variant="h3" fontWeight={700} color="error.main">{stats.admins}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="overline" color="text.secondary">Managers</Typography><Typography variant="h3" fontWeight={700} color="primary.main">{stats.managers}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="overline" color="text.secondary">Staff</Typography><Typography variant="h3" fontWeight={700} color="text.secondary">{stats.staff}</Typography></CardContent></Card>
      </Box>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={65} sx={{ mb: 2, borderRadius: 2 }} />)}</CardContent>
        </Card>
      ) : (
        <Table
          columns={columns}
          data={users}
          actions={(row) => (
            <>
              <Tooltip title="Edit User">
                <IconButton size="small" color="primary" onClick={() => openDialog(row)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={row.is_active ? 'Deactivate' : 'Activate'}>
                <IconButton size="small" color={row.is_active ? 'warning' : 'success'} onClick={() => toggleUserStatus(row)}>
                  {row.is_active ? <PersonOff /> : <CheckCircle />}
                </IconButton>
              </Tooltip>
            </>
          )}
        />
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEdit ? 'Edit User' : 'Add New User'}
          <IconButton
            aria-label="close"
            onClick={closeDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
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

              {!isEdit && (
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
            <Button onClick={closeDialog} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{isEdit ? 'Update' : 'Create'} User</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UsersView;

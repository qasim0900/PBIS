import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Tooltip, IconButton
} from '@mui/material';
import { Add, Edit, Person, AdminPanelSettings, SupervisedUserCircle, PersonOff, CheckCircle } from '@mui/icons-material';

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
  const { users, loading } = useSelector((state) => state.users);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff'
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const getRoleInfo = (role) => ROLES.find(r => r.value === role) || ROLES[2];
  const getInitials = (name) => name?.slice(0, 2).toUpperCase() || 'U';

  // Toggle user active status
  const toggleUserStatus = (user) => {
    dispatch(updateUser({ id: user.id, data: { is_active: !user.is_active } }))
      .unwrap()
      .then(() => dispatch(showNotification({ message: 'Status updated', type: 'success' })))
      .catch(() => dispatch(showNotification({ message: 'Failed to update status', type: 'error' })));
  };

  // Open Add Modal
  const openAddModal = () => {
    setForm({ username: '', email: '', password: '', role: 'staff' });
    setIsEditMode(false);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setForm({
      username: user.username,
      email: user.email,
      password: '', // password edit mein nahi bhejte
      role: user.role
    });
    setCurrentUserId(user.id);
    setIsEditMode(true);
    setModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setCurrentUserId(null);
    setForm({ username: '', email: '', password: '', role: 'staff' });
  };

  // Handle Create
  const handleCreate = () => {
    if (!form.username || !form.email || !form.password) {
      dispatch(showNotification({ message: 'All fields are required', type: 'error' }));
      return;
    }

    dispatch(createUser({
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role
    }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'User created successfully', type: 'success' }));
        closeModal();
      })
      .catch(() => dispatch(showNotification({ message: 'Failed to create user', type: 'error' })));
  };

  // Handle Update
  const handleUpdate = () => {
    if (!form.username || !form.email) {
      dispatch(showNotification({ message: 'Username and Email are required', type: 'error' }));
      return;
    }

    dispatch(updateUser({
      id: currentUserId,
      data: {
        username: form.username,
        email: form.email,
        role: form.role
      }
    }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'User updated successfully', type: 'success' }));
        closeModal();
      })
      .catch(() => dispatch(showNotification({ message: 'Failed to update user', type: 'error' })));
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const stats = {
    total: safeUsers.length,
    admins: safeUsers.filter(u => u.role === 'admin').length,
    managers: safeUsers.filter(u => u.role === 'manager').length,
    staff: safeUsers.filter(u => u.role === 'staff').length,
  };

  const columns = [
    {
      header: 'User',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: row.is_active ? 1 : 0.5 }}>
          <Avatar
            sx={{
              bgcolor: `${getRoleInfo(row.role).color}.main`,
              opacity: row.is_active ? 1 : 0.4
            }}
          >
            {getInitials(row.username)}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ color: row.is_active ? 'text.primary' : 'text.disabled' }}
            >
              {row.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      header: 'Role',
      render: (row) => {
        const roleInfo = getRoleInfo(row.role);
        return <Chip icon={roleInfo.icon} label={roleInfo.label} size="small" color={roleInfo.color} variant="outlined" />;
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
          sx={{
            opacity: row.is_active ? 1 : 0.6,           // disabled ko thoda fade kar do
            '& .MuiChip-label': {
              color: row.is_active ? 'inherit' : 'text.disabled'
            }
          }}
        />
      )
    }
  ];

  return (
    <Box>
      <Header title="User Management" subtitle="Manage user accounts and permissions">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
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
        <Card><CardContent>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={65} sx={{ mb: 2, borderRadius: 2 }} />)}</CardContent></Card>
      ) : (
        <Table
          columns={columns}
          data={safeUsers}
          actions={(row) => (
            <>
              <Tooltip title="Edit User">
                <IconButton size="small" color="primary" onClick={() => openEditModal(row)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={row.is_active ? 'Deactivate' : 'Activate'}>
                <IconButton
                  size="small"
                  color={row.is_active ? 'warning' : 'success'}
                  onClick={() => toggleUserStatus(row)}
                >
                  {row.is_active ? <PersonOff /> : <CheckCircle />}
                </IconButton>
              </Tooltip>
            </>
          )}
        />
      )}

      {/* SINGLE MODAL - ADD OR EDIT */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Username"
              fullWidth
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {!isEditMode && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            )}
            <TextField
              select
              label="Role"
              fullWidth
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map(role => (
                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={isEditMode ? handleUpdate : handleCreate}>
            {isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersView;
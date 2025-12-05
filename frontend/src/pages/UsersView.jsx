import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar, Skeleton,
  Tooltip, IconButton
} from '@mui/material';
import { Add, Edit, Person, AdminPanelSettings, SupervisedUserCircle, PersonOff, CheckCircle } from '@mui/icons-material';

import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal'; 
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

  // Modal & Form State
  const [modalState, setModalState] = useState({ open: false, isEdit: false, user: null });

  const openModal = (user = null) => {
    setModalState({
      open: true,
      isEdit: Boolean(user),
      user,
    });
  };

  const closeModal = () => setModalState({ open: false, isEdit: false, user: null });

  const handleFormSubmit = async (formData) => {
    try {
      if (modalState.isEdit) {
        await dispatch(updateUser({ id: modalState.user.id, data: formData })).unwrap();
        dispatch(showNotification({ message: 'User updated successfully', type: 'success' }));
      } else {
        await dispatch(createUser(formData)).unwrap();
        dispatch(showNotification({ message: 'User created successfully', type: 'success' }));
      }
      closeModal();
    } catch {
      dispatch(showNotification({ message: 'Operation failed', type: 'error' }));
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

  // Memoized stats
  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    staff: users.filter(u => u.role === 'staff').length,
  }), [users]);

  // Utility Functions
  const getRoleInfo = useCallback(role => ROLES.find(r => r.value === role) || ROLES[2], []);
  const getInitials = useCallback(name => name?.slice(0, 2).toUpperCase() || 'U', []);

  // Table Columns
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
          sx={{ opacity: row.is_active ? 1 : 0.6, '& .MuiChip-label': { color: row.is_active ? 'inherit' : 'text.disabled' } }}
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
          onClick={() => openModal()}
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
                <IconButton size="small" color="primary" onClick={() => openModal(row)}>
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

      {/* Modal */}
      <Modal
        open={modalState.open}
        isEdit={modalState.isEdit}
        user={modalState.user}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};

export default UsersView;

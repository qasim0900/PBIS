import TableView from '../../components/template';
import AppLoading from '../../components/AppLoading';
import { showNotification } from '../../api/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, IconButton, Chip } from '@mui/material';
import { ROLES, getStatsCards, UserDialog } from './UsersViewUI';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Add, Edit, CheckCircle, PersonOff } from '@mui/icons-material';
import { fetchUsers, createUser, updateUser, setSelectedUser } from './usersSlice';


//---------------------------------------
// :: UsersView Component
//---------------------------------------


const UsersView = () => {
  const dispatch = useDispatch();
  const { users = [], loading, selectedUser } = useSelector(s => s.users);
  const { user: currentUser } = useSelector(s => s.auth);

  //---------------------------------------
  // :: Local State
  //---------------------------------------


  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'staff',
    password: '',
    confirmPassword: ''
  });

  //---------------------------------------
  // :: Dialog Handlers
  //---------------------------------------


  const openDialog = useCallback((user = null) => {
    dispatch(setSelectedUser(user));
    setFormData(
      user
        ? { username: user.username, email: user.email, role: user.role, password: '', confirmPassword: '' }
        : { username: '', email: '', role: 'staff', password: '', confirmPassword: '' }
    );
    setDialogOpen(true);
  }, [dispatch]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    dispatch(setSelectedUser(null));
    setFormData({ username: '', email: '', role: 'staff', password: '', confirmPassword: '' });
  }, [dispatch]);



  //---------------------------------------
  // :: Submit Handler
  //---------------------------------------

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedUser && formData.password !== formData.confirmPassword) {
      return dispatch(showNotification({ message: 'Passwords do not match', type: 'error' }));
    }
    const payload = {
      username: formData.username,
      email: formData.email,
      role: formData.role,
      ...(selectedUser ? {} : { password: formData.password })
    };
    try {
      if (selectedUser) {
        await dispatch(updateUser({ id: selectedUser.id, data: payload })).unwrap();
        dispatch(showNotification({ message: 'User updated successfully', type: 'success' }));
      } else {
        await dispatch(createUser(payload)).unwrap();
        dispatch(showNotification({ message: 'User created successfully', type: 'success' }));
      }
      closeDialog();
    } catch (err) {
      const errorMessage = 
        err?.username?.[0] ||
        err?.email?.[0] ||
        err?.password?.[0] ||
        err?.detail ||
        err?.message ||
        'Unable to save user. Please try again.';
      dispatch(showNotification({
        message: errorMessage,
        type: 'error'
      }));
    }
  }, [dispatch, formData, selectedUser, closeDialog]);



  //---------------------------------------
  // :: Toggle User Active Status
  //---------------------------------------



  const toggleUserStatus = useCallback(async (user) => {
    try {
      await dispatch(updateUser({ id: user.id, data: { is_active: !user.is_active } })).unwrap();
      dispatch(showNotification({ message: 'Status updated', type: 'success' }));
    } catch {
      dispatch(showNotification({ message: 'Failed to update status', type: 'error' }));
    }
  }, [dispatch]);


  //---------------------------------------
  // :: Initial Fetch
  //---------------------------------------


  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);



  //---------------------------------------
  // :: Stats & Helpers
  //---------------------------------------


  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    staff: users.filter(u => u.role === 'staff').length
  }), [users]);

  //---------------------------------------
  // :: Table Columns
  //---------------------------------------


  const getRoleInfo = useCallback(role => ROLES.find(r => r.value === role) || ROLES[2], []);
  const getInitials = useCallback(name => name?.slice(0, 2).toUpperCase() || 'U', []);

  //---------------------------------------
  // :: Table Columns
  //---------------------------------------


  const columns = useMemo(() => [
    {
      header: 'User',
      render: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: row.is_active ? 1 : 0.5 }}>
          <Box sx={{
            bgcolor: `${getRoleInfo(row.role).color}.main`,
            opacity: row.is_active ? 1 : 0.4,
            borderRadius: '50%', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{getInitials(row.username)}</Box>
          <Box>
            <Box sx={{ fontWeight: 600, color: row.is_active ? 'text.primary' : 'text.disabled' }}>{row.username}</Box>
            <Box sx={{ color: 'text.secondary' }}>{row.email}</Box>
          </Box>
        </Box>
      )
    },
    {
      header: 'Role',
      render: row => {
        const role = getRoleInfo(row.role);
        return <Chip icon={role.icon} label={role.label} size="small" color={role.color} variant="outlined" />;
      }
    },
    {
      header: 'Status',
      render: row => (
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

  //---------------------------------------
  // :: Render
  //---------------------------------------

  // Show loading screen when initial data is being fetched
  if (loading && users.length === 0) {
    return <AppLoading />;
  }

  return (
    <Box>
      <TableView
        title="User Management"
        subtitle="Manage user accounts and permissions"
        columns={columns}
        data={users}
        loading={loading}
        summaryCards={getStatsCards(stats)}
        extraHeaderActions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openDialog()}
            sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >Add User</Button>
        }
        actions={row => (
          <>
            <IconButton size="small" color="primary" onClick={() => openDialog(row)}><Edit fontSize="small" /></IconButton>
            <IconButton
              size="small"
              color={row.is_active ? 'warning' : 'success'}
              onClick={() => toggleUserStatus(row)}
              disabled={row.id === currentUser.id}
            >{row.is_active ? <PersonOff /> : <CheckCircle />}</IconButton>
          </>
        )}
      />
      <UserDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        selectedUser={selectedUser}
      />
    </Box>
  );
};

export default UsersView;

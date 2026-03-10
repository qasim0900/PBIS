import { motion } from 'framer-motion';
import TableView from '../../components/template';
import AppLoading from '../../components/AppLoading';
import { showNotification } from '../../api/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, IconButton, Chip } from '@mui/material';
import { ROLES, getStatsCards, UserDialog } from './UsersViewUI';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Add, Edit, CheckCircle, PersonOff } from '@mui/icons-material';
import { fetchUsers, createUser, updateUser, setSelectedUser } from './usersSlice';

const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

const UsersView = () => {
  const dispatch = useDispatch();
  const { users = [], loading, selectedUser } = useSelector(s => s.users);
  const { user: currentUser } = useSelector(s => s.auth);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'staff',
    password: '',
    confirmPassword: ''
  });

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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.username || !formData.username.trim()) {
      return dispatch(showNotification({ 
        message: 'Username is required', 
        type: 'error' 
      }));
    }
    
    if (!formData.email || !formData.email.trim()) {
      return dispatch(showNotification({ 
        message: 'Email is required', 
        type: 'error' 
      }));
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return dispatch(showNotification({ 
        message: 'Please enter a valid email address', 
        type: 'error' 
      }));
    }
    
    if (!selectedUser) {
      if (!formData.password) {
        return dispatch(showNotification({ 
          message: 'Password is required for new users', 
          type: 'error' 
        }));
      }
      
      if (formData.password.length < 8) {
        return dispatch(showNotification({ 
          message: 'Password must be at least 8 characters long', 
          type: 'error' 
        }));
      }
      
      if (formData.password !== formData.confirmPassword) {
        return dispatch(showNotification({ 
          message: 'Passwords do not match', 
          type: 'error' 
        }));
      }
    }
    
    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      role: formData.role,
      ...(selectedUser ? {} : { password: formData.password })
    };
    
    try {
      if (selectedUser) {
        await dispatch(updateUser({ id: selectedUser.id, data: payload })).unwrap();
        dispatch(showNotification({ 
          message: `✓ User "${payload.username}" updated successfully`, 
          type: 'success' 
        }));
      } else {
        await dispatch(createUser(payload)).unwrap();
        dispatch(showNotification({ 
          message: `✓ User "${payload.username}" created successfully`, 
          type: 'success' 
        }));
      }
      closeDialog();
    } catch (err) {
      console.error('User save error:', err);
      
      // Handle field-specific errors
      if (err.fieldErrors) {
        const errorMessages = Object.entries(err.fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        
        dispatch(showNotification({
          message: errorMessages || 'Validation failed',
          type: 'error'
        }));
      } else {
        // Handle general errors
        const errorMessage = 
          err?.message ||
          err?.username?.[0] ||
          err?.email?.[0] ||
          err?.password?.[0] ||
          err?.detail ||
          'Unable to save user. Please try again.';
        
        dispatch(showNotification({
          message: errorMessage,
          type: 'error'
        }));
      }
    }
  }, [dispatch, formData, selectedUser, closeDialog]);

  const toggleUserStatus = useCallback(async (user) => {
    if (!user || !user.id) {
      dispatch(showNotification({ 
        message: 'Invalid user', 
        type: 'error' 
      }));
      return;
    }
    
    try {
      await dispatch(updateUser({ 
        id: user.id, 
        data: { is_active: !user.is_active } 
      })).unwrap();
      
      const status = !user.is_active ? 'activated' : 'deactivated';
      dispatch(showNotification({ 
        message: `✓ User "${user.username}" ${status} successfully`, 
        type: 'success' 
      }));
    } catch (err) {
      console.error('Toggle status error:', err);
      
      const errorMessage = err?.message || 
                          err?.detail || 
                          'Failed to update user status. Please try again.';
      
      dispatch(showNotification({ 
        message: errorMessage, 
        type: 'error' 
      }));
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUsers())
      .unwrap()
      .catch((err) => {
        console.error('Fetch users error:', err);
        const errorMessage = err?.message || 
                            err?.detail || 
                            'Failed to load users. Please refresh the page.';
        dispatch(showNotification({ 
          message: errorMessage, 
          type: 'error' 
        }));
      });
  }, [dispatch]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    staff: users.filter(u => u.role === 'staff').length
  }), [users]);

  const getRoleInfo = useCallback(role => ROLES.find(r => r.value === role) || ROLES[2], []);
  const getInitials = useCallback(name => name?.slice(0, 2).toUpperCase() || 'U', []);

  const columns = useMemo(() => [
    {
      header: 'User',
      render: row => (
        <Box className="flex items-center gap-3" sx={{ opacity: row.is_active ? 1 : 0.5 }}>
          <Box 
            className="rounded-full w-10 h-10 flex items-center justify-center text-white font-bold"
            sx={{
              bgcolor: `${getRoleInfo(row.role).color}.main`,
              opacity: row.is_active ? 1 : 0.4,
            }}
          >
            {getInitials(row.username)}
          </Box>
          <Box>
            <Box className="font-semibold" sx={{ color: row.is_active ? 'text.primary' : 'text.disabled' }}>
              {row.username}
            </Box>
            <Box className="text-sm text-gray-500">{row.email}</Box>
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

  if (loading && users.length === 0) {
    return <AppLoading />;
  }

  return (
    <motion.div {...fadeIn}>
      <Box>
        <TableView
          title="User Management"
          subtitle="Manage user accounts and permissions"
          columns={columns}
          data={users}
          loading={loading}
          summaryCards={getStatsCards(stats)}
          extraHeaderActions={
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => openDialog()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:shadow-xl transition-shadow"
              >
                Add User
              </Button>
            </motion.div>
          }
          actions={row => (
            <Box className="flex gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton size="small" color="primary" onClick={() => openDialog(row)}>
                  <Edit fontSize="small" />
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  color={row.is_active ? 'warning' : 'success'}
                  onClick={() => toggleUserStatus(row)}
                  disabled={row.id === currentUser.id}
                >
                  {row.is_active ? <PersonOff /> : <CheckCircle />}
                </IconButton>
              </motion.div>
            </Box>
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
    </motion.div>
  );
};

export default UsersView;

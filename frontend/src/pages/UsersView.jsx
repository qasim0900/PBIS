import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box, Card, CardContent, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Chip, Avatar, Skeleton, Fade, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';

import {
  Add, Edit, Person, AdminPanelSettings, SupervisedUserCircle,
  PersonOff, CheckCircle
} from '@mui/icons-material';

import Header from '../components/Header';
import { showNotification } from '../store/slices/uiSlice';
import {
  fetchUsers,
  createUser,
  updateUser
} from '../store/slices/usersSlice';


const ROLES = [
  { value: 'admin', label: 'Admin', color: 'error', icon: <AdminPanelSettings /> },
  { value: 'manager', label: 'Manager', color: 'primary', icon: <SupervisedUserCircle /> },
  { value: 'staff', label: 'Staff', color: 'default', icon: <Person /> },
];

const UsersView = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
  });

  // -------- FETCH USERS ON LOAD --------
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const getRoleInfo = (role) =>
    ROLES.find((r) => r.value === role) || ROLES[2];

  const getInitials = (name) =>
    name?.slice(0, 2).toUpperCase() || 'U';

  // -------- TOGGLE ACTIVE STATUS --------
  const toggleUserStatus = (user) => {
    dispatch(updateUser({
      id: user.id,
      data: { is_active: !user.is_active }
    }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'User status updated', type: 'success' }));
      })
      .catch(() => {
        dispatch(showNotification({ message: 'Failed to update user', type: 'error' }));
      });
  };

  // -------- CREATE USER --------
  const handleCreateUser = () => {
    dispatch(createUser(form))
      .unwrap()
      .then(() => {
        dispatch(showNotification({
          message: 'User created successfully',
          type: 'success'
        }));
        setModalOpen(false);
        setForm({ username: '', email: '', password: '', role: 'staff' });
      })
      .catch(() => {
        dispatch(showNotification({
          message: 'Failed to create user',
          type: 'error'
        }));
      });
  };

  // -------- USER STATS (Fixed) --------
  const safeUsers = Array.isArray(users) ? users : [];

  const stats = {
    total: safeUsers.length,
    admins: safeUsers.filter((u) => u.role === 'admin').length,
    managers: safeUsers.filter((u) => u.role === 'manager').length,
    staff: safeUsers.filter((u) => u.role === 'staff').length,
  };

  return (
    <Box>
      <Header title="User Management" subtitle="Manage user accounts and permissions">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Add User
        </Button>
      </Header>

      {/* -------- STATS CARDS -------- */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>Total Users</Typography>
            <Typography variant="h3" fontWeight={700}>{stats.total}</Typography>
          </CardContent>
        </Card>

        <Card><CardContent>
          <Typography variant="overline" color="text.secondary">Admins</Typography>
          <Typography variant="h3" fontWeight={700} color="error.main">{stats.admins}</Typography>
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="overline" color="text.secondary">Managers</Typography>
          <Typography variant="h3" fontWeight={700} color="primary.main">{stats.managers}</Typography>
        </CardContent></Card>

        <Card><CardContent>
          <Typography variant="overline" color="text.secondary">Staff</Typography>
          <Typography variant="h3" fontWeight={700} color="text.secondary">{stats.staff}</Typography>
        </CardContent></Card>
      </Box>

      {/* -------- USERS TABLE -------- */}
      {loading ? (
        <Card>
          <CardContent>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Fade in={true}>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {safeUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);

                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: `${roleInfo.color}.main` }}>
                              {getInitials(user.username)}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {user.username}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={roleInfo.icon}
                            label={roleInfo.label}
                            size="small"
                            color={roleInfo.color}
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            icon={user.is_active ? <CheckCircle /> : <PersonOff />}
                            label={user.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.is_active ? 'success' : 'default'}
                            variant={user.is_active ? 'filled' : 'outlined'}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton size="small" color="primary">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              size="small"
                              color={user.is_active ? 'warning' : 'success'}
                              onClick={() => toggleUserStatus(user)}
                            >
                              {user.is_active ? <PersonOff /> : <CheckCircle />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>

              </Table>
            </TableContainer>
          </Card>
        </Fade>
      )}

      {/* -------- ADD USER MODAL -------- */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <TextField
              select
              label="Role"
              fullWidth
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser}>Create User</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default UsersView;

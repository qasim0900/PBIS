import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api, { addAuthRefreshListener } from '../services/api';

import { 
  loginUser, 
  fetchCurrentUser, 
  logoutUser, 
  selectAuth, 
  selectIsAdmin, 
  selectIsManager 
} from '../store/slices/authSlice';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  // ---- FIX: This will NEVER be undefined now ----
  const { user, token, loading } = useSelector(selectAuth);

  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);

  // Restore user when token is already in localStorage
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (!user) dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  // Token refresh → update user
  useEffect(() => {
    const unregister = addAuthRefreshListener((newAccessToken) => {
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      dispatch(fetchCurrentUser());
    });

    return () => unregister();
  }, [dispatch]);

  // LOGIN FUNCTION
  const login = async (username, password) => {
    try {
      const result = await dispatch(loginUser({ username, password })).unwrap();

      // Save new token for all next requests
      api.defaults.headers.common["Authorization"] = `Bearer ${result.tokens.access}`;

      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // LOGOUT FUNCTION
  const logout = () => {
    dispatch(logoutUser());
    delete api.defaults.headers.common["Authorization"];
  };

  const isStaff = user?.role === "staff" || isManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAdmin,
        isManager,
        isStaff,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

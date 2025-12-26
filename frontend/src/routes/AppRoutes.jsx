import Layout from './Layout';
import { useEffect } from 'react';
import Login from '../pages/loginView/LoginView';
import UsersView from '../pages/userView/UsersView';
import { useSelector, useDispatch } from 'react-redux';
import CountsView from '../pages/countView/CountsView';
import ProtectedRoute from '../context/ProtectedRoute';
import { Routes, Route, Navigate } from 'react-router-dom';
import ReportsView from '../pages/reportsView/ReportsView';
import CatalogView from '../pages/catalogView/CatalogView';
import LowStockView from '../pages/lowStockView/LowStockView';
import LocationsView from '../pages/locationView/LocationsView';
import OverridesView from '../pages/overRidesView/OverridesView';
import { selectAuthState, fetchCurrentUser } from '../pages/loginView/authSlice';

const AppRoutes = () => {
    const { token, isAuthenticated, user } = useSelector(selectAuthState);
    const role = user?.role;
    const dispatch = useDispatch();

    useEffect(() => {
        if (token && !isAuthenticated) {
            dispatch(fetchCurrentUser());
        }
    }, [token, isAuthenticated, dispatch]);

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/counts" /> : <Login />} />
            <Route path="/counts" element={<ProtectedRoute><Layout hideSidebar={role === 'staff'}><CountsView /></Layout></ProtectedRoute>} />
            <Route path="/low-stock" element={<ProtectedRoute requireManager><Layout><LowStockView /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requireManager><Layout><ReportsView /></Layout></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute requireAdmin><Layout><LocationsView /></Layout></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute requireAdmin><Layout><CatalogView /></Layout></ProtectedRoute>} />
            <Route path="/overrides" element={<ProtectedRoute requireAdmin><Layout><OverridesView /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requireAdmin><Layout><UsersView /></Layout></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/counts" />} />
            <Route path="*" element={<Navigate to="/counts" />} />
        </Routes>
    );
};

export default AppRoutes;

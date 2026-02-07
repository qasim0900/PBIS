import Layout from './Layout';
import { useEffect, useMemo } from 'react';
import ProtectedRoute from '../context/ProtectedRoute';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';

//---------------------------------------
// :: Import Page Components
//---------------------------------------

/*
Imports various page components and authentication utilities (selectAuthState, fetchCurrentUser) for routing and state management.
*/

import Login from '../pages/loginView/LoginView';
import UsersView from '../pages/userView/UsersView';
import CountsView from '../pages/countView/CountsView';
import VendorView from '../pages/VendorView/VendorView';
import BrandView from '../pages/BrandView/BrandView';
import ReportsView from '../pages/reportsView/ReportsView';
import CatalogView from '../pages/catalogView/CatalogView';
import LocationsView from '../pages/locationView/LocationsView';
import FrequencyView from '../pages/FrequencyView/FrequencyView';
import { selectAuthState, fetchCurrentUser } from '../pages/loginView/authSlice';


//---------------------------------------
// :: AppRoutes Function
//---------------------------------------

/*
Defines app routes: fetches current user if needed, protects routes based on roles, and sets up public, protected, default, and fallback navigation.
*/

const AppRoutes = () => {
    const dispatch = useDispatch();
    const { token, isAuthenticated, user } = useSelector(selectAuthState);
    const role = user?.role;

    //---------------------------------------
    // :: UseEffect Fetch Token Function
    //---------------------------------------

    /*
    Fetches the current user if a token exists but the user isn’t authenticated.
    */

    useEffect(() => {
        if (token && !isAuthenticated) {
            dispatch(fetchCurrentUser());
        }
    }, [token, isAuthenticated, dispatch]);


    //---------------------------------------
    // :: protected routes Function
    //---------------------------------------

    /*
    Creates a memoized list of protected routes with role-based access and optional sidebar visibility.
    */

    const protectedRoutes = useMemo(
        () => [
            { path: '/counts', element: <CountsView />, hideSidebar: role === 'staff' },
            { path: '/frequencies', element: <FrequencyView />, requireManager: true },
            { path: '/reports', element: <ReportsView />, requireManager: true },
            { path: '/locations', element: <LocationsView />, requireAdmin: true },
            { path: '/vendors', element: <VendorView />, requireAdmin: true },
            { path: '/brands', element: <BrandView />, requireAdmin: true },
            { path: '/catalog', element: <CatalogView />, requireAdmin: true },
            { path: '/users', element: <UsersView />, requireAdmin: true },
        ],
        [role]
    );


    //---------------------------------------
    // :: Return Code
    //---------------------------------------

    /*
    Renders routing: handles public login, maps protected routes with role checks and layout, 
    and redirects default or unknown paths to `/counts`.
    */

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/counts" replace /> : <Login />}
            />
            {protectedRoutes.map(({ path, element, hideSidebar, requireAdmin, requireManager }) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRoute requireAdmin={requireAdmin} requireManager={requireManager}>
                            <Layout hideSidebar={hideSidebar}>{element}</Layout>
                        </ProtectedRoute>
                    }
                />
            ))}
            <Route path="/" element={<Navigate to="/counts" replace />} />
            <Route path="*" element={<Navigate to="/counts" replace />} />
        </Routes>
    );
};


//---------------------------------------
// :: Export App Routes
//---------------------------------------

/*
Exports the `AppRoutes` component as the default export for use in the app.
*/

export default AppRoutes;

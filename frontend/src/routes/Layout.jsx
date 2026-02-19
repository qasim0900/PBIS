import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, useMediaQuery, useTheme } from '@mui/material';


//---------------------------------------
// :: Import Components
//---------------------------------------

/*
Imports `Sidebar` and `MenuAppBar` components, and Redux selectors/actions for managing sidebar collapse state.
*/

import Sidebar from '../components/Sidebar';
import MenuAppBar from '../components/Navbar';
import { selectSidebarCollapsed, setSidebarCollapsed } from '../api/uiSlice';


//---------------------------------------
// :: Layout Function
//---------------------------------------

/*
Defines a responsive layout with a top navbar, optional sidebar, and main content area that collapses the sidebar on click if open.
*/

const Layout = ({ children, hideSidebar = false }) => {
    const collapsed = useSelector(selectSidebarCollapsed);
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    //---------------------------------------
    // :: handleMainClick Function
    //---------------------------------------

    /*
    Collapses the sidebar when the main content is clicked, but only if it’s open and not on mobile.
    */

    const handleMainClick = useCallback(() => {
        if (!collapsed && !isMobile) {
            dispatch(setSidebarCollapsed(true));
        }
    }, [collapsed, dispatch, isMobile]);


    //---------------------------------------
    // :: Return Code
    //---------------------------------------

    /*
    Renders the layout with a top navbar, optional sidebar, and main content area that handles clicks 
    to collapse the sidebar on desktop.
    */

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MenuAppBar />
            <Box sx={{ display: 'flex', flex: 1 }}>
                {!hideSidebar && <Sidebar />}
                <Box
                    component="main"
                    onClick={handleMainClick}
                    sx={{
                        flexGrow: 1,
                        mt: '64px',
                        p: { xs: 1, sm: 2, md: 3 },
                        backgroundColor: '#f8fafc',
                        width: '100%',
                        transition: 'margin 0.3s ease',
                        cursor: !collapsed && !isMobile ? 'pointer' : 'default',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};


//---------------------------------------
// :: Export LayOut 
//---------------------------------------

/*
Exports the Layout component as the default export for use in the app.
*/


export default Layout;

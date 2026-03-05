import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import MenuAppBar from '../components/Navbar';
import { selectSidebarCollapsed, setSidebarCollapsed } from '../api/uiSlice';

const Layout = ({ children, hideSidebar = false }) => {
    const collapsed = useSelector(selectSidebarCollapsed);
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();

    const handleMainClick = useCallback(() => {
        if (!collapsed && !isMobile) {
            dispatch(setSidebarCollapsed(true));
        }
    }, [collapsed, dispatch, isMobile]);

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
                        overflowX: 'hidden'
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;

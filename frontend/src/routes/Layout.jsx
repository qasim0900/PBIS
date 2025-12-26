import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import MenuAppBar from '../components/Navbar';
import { selectSidebarCollapsed } from '../pages/uiSlice'
import { Box, useMediaQuery, useTheme } from '@mui/material';

const DRAWER_WIDTH = 0;
const COLLAPSED_WIDTH = 0;

const Layout = ({ children, hideSidebar = false }) => {
    const collapsed = useSelector(selectSidebarCollapsed);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const sidebarWidth = isMobile ? 0 : (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MenuAppBar />
            <Box sx={{ display: 'flex', flex: 1 }}>
                {!hideSidebar && <Sidebar />}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        ml: !hideSidebar && !isMobile ? `${sidebarWidth}px` : 0,
                        mt: '64px',
                        transition: 'margin 0.3s ease',
                        p: { xs: 1, sm: 2, md: 3 },
                        backgroundColor: '#f8fafc',
                        width: !hideSidebar && !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;

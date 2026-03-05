import { motion } from "framer-motion";
import { Refresh } from "@mui/icons-material";
import {
    Paper,
    Box,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";



//-----------------------------------
// :: Page Header Function
//-----------------------------------

/*
This `PageHeader` component renders a responsive header with a title, optional subtitle, refresh button, 
and space for child elements like filters or actions.
*/

const PageHeader = ({ title, subtitle, children, showRefresh, onRefresh }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    //-----------------------------------
    // :: Return Code 
    //-----------------------------------

    /*
    This JSX renders a responsive header bar with the title, optional subtitle, refresh button, and a container for child elements.
    */

    return (
        <Box className="mb-6">
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 3,
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography
                            variant={isMobile ? "h5" : "h4"}
                            sx={{ 
                                fontWeight: 800, 
                                color: "primary.main",
                                letterSpacing: '-0.02em'
                            }}
                        >
                            {title}
                        </Typography>

                        {showRefresh && (
                            <IconButton 
                                onClick={onRefresh} 
                                size="small"
                                sx={{ 
                                    bgcolor: 'rgba(124, 58, 237, 0.05)',
                                    '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.1)' }
                                }}
                            >
                                <Refresh fontSize="small" color="primary" />
                            </IconButton>
                        )}
                    </Box>

                    {subtitle && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, fontWeight: 500 }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {children && (
                    <Box sx={{ width: { xs: "100%", md: "auto" } }}>{children}</Box>
                )}
            </Paper>
        </Box>
    );
};


//-----------------------------------
// :: Export Page Header 
//-----------------------------------

/*
This exports the `PageHeader` component so it can be used in other parts of the app.
*/

export default PageHeader;

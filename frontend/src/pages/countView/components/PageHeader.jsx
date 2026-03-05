import { Refresh } from "@mui/icons-material";
import {
    AppBar,
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
        <Box sx={{ mb: 0 }}>
            <AppBar
                position="static"
                color="transparent"
                elevation={0}
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Toolbar
                    sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        py: 2,
                        gap: 2,
                    }}
                >
                    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography
                                variant={isMobile ? "h5" : "h4"}
                                sx={{ fontWeight: 700, color: "text.primary" }}
                            >
                                {title}
                            </Typography>

                            {showRefresh && (
                                <IconButton onClick={onRefresh} size="small">
                                    <Refresh fontSize="small" />
                                </IconButton>
                            )}
                        </Box>

                        {subtitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {children && (
                        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>{children}</Box>
                    )}
                </Toolbar>
            </AppBar>
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

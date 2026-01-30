import InventoryCard from "./InventoryCard";
import { CheckCircle } from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";


//-----------------------------------
// :: Card View Function
//-----------------------------------

/*
This component shows loading skeletons, an empty state message, or a grid of `InventoryCard` 
items depending on the data and loading status.
*/

const CardView = ({ data = [], loading = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    if (loading) {
        return (
            <Stack spacing={isMobile ? 2 : 3}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                ))}
            </Stack>
        );
    }
    if (!data || data.length === 0) {
        return (
            <Card sx={{ textAlign: "center", py: { xs: 6, sm: 8 } }}>
                <CardContent>
                    <CheckCircle sx={{ fontSize: { xs: 60, sm: 80 }, color: "success.main", mb: 2 }} />
                    <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
                        All clear!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        No items to count
                    </Typography>
                </CardContent>
            </Card>
        );
    }


    //-----------------------------------
    // :: Return Code
    //-----------------------------------

    /*
    This renders a scrollable grid layout of `InventoryCard` components for each entry in the data.
    */

    return (
        <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
            <Box
                sx={{
                    display: "grid",
                    gap: { xs: 1.5, sm: 2 },
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                    p: { xs: 0.5, sm: 1 },
                }}
            >
                {data.map((entry) => (
                    <InventoryCard key={entry.id} item={entry} />
                ))}
            </Box>
        </Box>
    );
};

//-----------------------------------
// :: Export CardView
//-----------------------------------

/*
This exports the `CardView` component so it can be used in other parts of the application.
*/

export default CardView;
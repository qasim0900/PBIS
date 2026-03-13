import { motion } from "framer-motion";
import TableView from "../../components/template";
import SplitButton from "../../components/SplitButton";
import { Box, TextField, MenuItem, Typography, Card, CardContent } from "@mui/material";

//---------------------------------------
// :: Animations
//---------------------------------------
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } };

/*
A presentational component for viewing, filtering, and exporting inventory reports.
Includes filters for Location, Inventory List, and Sheet Date.
*/

const ReportsViewUI = ({
    locations,
    frequencies,
    availableDates = [],
    selectedLocation,
    setSelectedLocation,
    selectedFrequency,
    setSelectedFrequency,
    selectedDate,
    setSelectedDate,
    sheets,
    handleLoadSheets,
    handleDownloadCSV,
    handlePrint,
    deleteReport,
    loading,
    reportColumns,
    data,
}) => {
    // Get report metadata for display
    const reportMetadata = data && data.length > 0 ? {
        location: data[0].reportLocation,
        frequency: data[0].reportFrequency
    } : null;

    //---------------------------------------
    // :: Handle SplitButton Actions
    //---------------------------------------
    const handleSplitButtonSelect = (index, option) => {
        switch (option) {
            case "Load Report":
                handleLoadSheets();
                break;
            case "Download CSV":
                handleDownloadCSV();
                break;
            case "View File":
                handlePrint();
                break;
            case "Delete Report":
                deleteReport();
                break;
            default:
                break;
        }
    };

    //---------------------------------------
    // :: Extra Header Actions
    //---------------------------------------
    const extraHeaderActions = (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "flex-end",
            }}
        >
            {/* Location Filter */}
            <TextField
                select
                label="Location"
                size="small"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                sx={{ minWidth: 200 }}
            >
                <MenuItem value="">Select Location</MenuItem>
                {locations.map((l) => (
                    <MenuItem key={l.id} value={l.id}>
                        {l.name}
                    </MenuItem>
                ))}
            </TextField>

            {/* Inventory List Filter */}
            <TextField
                select
                label="Inventory List"
                size="small"
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                sx={{ minWidth: 180 }}
                disabled={!selectedLocation}
            >
                <MenuItem value="">Select Inventory List</MenuItem>
                {frequencies.map((f) => (
                    <MenuItem key={f.id} value={f.value || f.id}>
                        {f.frequency_name}
                    </MenuItem>
                ))}
            </TextField>

            {/* SplitButton */}
            <SplitButton
                options={["Load Report", "Download CSV", "View File", "Delete Report"]}
                initialIndex={0}
                buttonLabel="Load Report"
                onSelect={handleSplitButtonSelect}
                disabled={!selectedLocation || !selectedFrequency}
            />
        </Box>
    );

    //---------------------------------------
    // :: Render Component
    //---------------------------------------
    return (
        <motion.div {...fadeIn}>
            {/* Report Metadata Display */}
            {reportMetadata && (
                <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
                    <CardContent sx={{ pb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Inventory Report
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Location
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {reportMetadata.location}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Inventory List
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {reportMetadata.frequency}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
            
            <TableView
                title="Reports"
                subtitle="Download your inventory reports"
                columns={reportColumns}
                data={data}
                searchable
                extraHeaderActions={extraHeaderActions}
                loading={loading}
                emptyTitle="No Reports"
                emptyMessage="Select a location and Inventory List to load reports."
                showRefresh={false}
            />
        </motion.div>
    );
};

export default ReportsViewUI;
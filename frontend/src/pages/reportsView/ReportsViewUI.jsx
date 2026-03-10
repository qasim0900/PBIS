import { motion } from "framer-motion";
import TableView from "../../components/template";
import SplitButton from "../../components/SplitButton";
import { Box, TextField, MenuItem } from "@mui/material";

//---------------------------------------
// :: Animations
//---------------------------------------
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } };

//---------------------------------------
// :: ReportsViewUI Component
//---------------------------------------

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
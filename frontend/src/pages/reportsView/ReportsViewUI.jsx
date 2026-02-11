import TableView from "../../components/template";
import SplitButton from "../../components/SplitButton";
import { Box, TextField, MenuItem } from "@mui/material";

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

    const extraHeaderActions = (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
            {sheets.length > 0 && (
                <TextField
                    select
                    label="Select Sheet"
                    size="small"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="">All Dates</MenuItem>
                    {availableDates.map((date) => (
                        <MenuItem key={date} value={date}>
                            {new Date(date).toLocaleDateString()}
                        </MenuItem>
                    ))}
                </TextField>
            )}

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
            <SplitButton
                options={["Load Report", "Download CSV", "View File", "Delete Report"]}
                initialIndex={0}
                buttonLabel="Load Report"
                onSelect={handleSplitButtonSelect}
                disabled={!selectedLocation || !selectedFrequency}
            />
        </Box>
    );

    return (
        <TableView
            title="Reports"
            subtitle="Download your inventory reports"
            columns={reportColumns}
            data={data}
            searchable={true}
            extraHeaderActions={extraHeaderActions}
            loading={loading}
            emptyTitle="No Reports"
            emptyMessage="Select a location and Inventory List to load reports."
            showRefresh={false}
        />
    );
};

export default ReportsViewUI;

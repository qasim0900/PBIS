import TableView from "../../components/template";
import SplitButton from "../../components/SplitButton";
import { Box, TextField, MenuItem } from "@mui/material";

const ReportsViewUI = ({
    locations,
    frequencies,
    selectedLocation,
    setSelectedLocation,
    selectedFrequency,
    setSelectedFrequency,
    sheets,
    selectedSheet,
    handleSheetChange,
    handleLoadSheets,
    handleDownloadCSV,
    handlePrint,
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
                    value={selectedSheet?.id || ""}
                    onChange={(e) => handleSheetChange(Number(e.target.value))}
                    sx={{ minWidth: 200 }}
                >
                    {sheets.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {new Date(s.count_date).toLocaleDateString()}
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
                label="Frequency"
                size="small"
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">Select Frequency</MenuItem>
                {frequencies.map((f) => (
                    <MenuItem key={f.id} value={f.value || f.id}>
                        {f.days_range}
                    </MenuItem>
                ))}
            </TextField>

            <SplitButton
                options={["Load Report", "Download CSV", "View File"]}
                initialIndex={0}
                buttonLabel="Load Report"
                onSelect={handleSplitButtonSelect}
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
            emptyMessage="Select a location and frequency to load reports."
            showRefresh={false}
        />
    );
};

export default ReportsViewUI;

import { Box, TextField, MenuItem, Button } from "@mui/material";
export default function LocationFrequencySelector({
    locations = [],
    selectedLocation = "",
    setSelectedLocation,
    selectedFrequency = "",
    setSelectedFrequency,
    frequencyOptions = [],
    onLoadData,
    loadDisabled,
    submitDisabled,
    onSubmit,
    loading,
    submitting,
}) {
    return (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3, alignItems: "center" }}>
            <TextField
                select
                label="Location"
                size="small"
                value={selectedLocation || ""}
                onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setSelectedFrequency("");
                }}
                sx={{ minWidth: 220 }}
            >
                <MenuItem value="">Select Location</MenuItem>
                {Array.isArray(locations) &&
                    locations.map((l) => (
                        <MenuItem key={l.id} value={l.id}>
                            {l.name}
                        </MenuItem>
                    ))}
            </TextField>

            <TextField
                select
                label="Frequency"
                size="small"
                value={selectedFrequency || ""}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                sx={{ minWidth: 200 }}
            >
                <MenuItem value="">Select Frequency</MenuItem>
                {Array.isArray(frequencyOptions) &&
                    frequencyOptions.map((f) => (
                        <MenuItem key={f.value} value={f.value}>
                            {f.label}
                        </MenuItem>
                    ))}
            </TextField>

            <Button variant="contained" disabled={loadDisabled} onClick={onLoadData}>
                {loading ? "Loading..." : "Load Data"}
            </Button>

            <Button variant="contained" color="success" disabled={submitDisabled} onClick={onSubmit}>
                {submitting ? "Submitting..." : "Submit"}
            </Button>
        </Box>
    );
}

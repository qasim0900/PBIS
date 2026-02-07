import { useCallback } from "react";
import { Box, TextField, MenuItem, Button } from "@mui/material";


//-------------------------------------------
// :: Location Frequency Selector Function
//-------------------------------------------

/*
`LocationFrequencySelector` is a reusable component with location and frequency dropdowns and load/submit buttons, 
using memoized handlers and state-controlled loading and disabled states.
*/

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


    //--------------------------------------
    // :: Handle Location Change Function
    //--------------------------------------

    /*
    This defines a memoized handler that updates the selected location and resets the frequency whenever the location changes.
    */

    const handleLocationChange = useCallback(
        (e) => {
            setSelectedLocation(e.target.value);
            setSelectedFrequency("");
        },
        [setSelectedLocation, setSelectedFrequency]
    );


    //--------------------------------------
    // :: Handle Location Change Function
    //--------------------------------------

    /*
    This defines a **memoized handler that updates the selected frequency** when the frequency dropdown changes.
    */

    const handleFrequencyChange = useCallback(
        (e) => setSelectedFrequency(e.target.value),
        [setSelectedFrequency]
    );


    //-----------------------------------
    // :: Return Code
    //-----------------------------------

    /*
    This JSX renders a **flex container with location and frequency dropdowns, plus Load Data and Submit buttons**,
     all controlled by state, with dynamic loading/submitting labels and disabled states.
    */

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                mb: 3,
                alignItems: "center",
            }}
        >

            <TextField
                select
                label="Location"
                size="small"
                value={selectedLocation || ""}
                onChange={handleLocationChange}
                sx={{ minWidth: 220 }}
            >
                <MenuItem value="">Select Location</MenuItem>
                {Array.isArray(locations) &&
                    locations.map(({ id, name }) => (
                        <MenuItem key={id} value={id}>
                            {name}
                        </MenuItem>
                    ))}
            </TextField>


            <TextField
                select
                label="Inventory List"
                size="small"
                value={selectedFrequency || ""}
                onChange={handleFrequencyChange}
                sx={{ minWidth: 200 }}
            >
                <MenuItem value="">Select Frequency</MenuItem>
                {Array.isArray(frequencyOptions) &&
                    frequencyOptions.map(({ value, label }) => (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    ))}
            </TextField>

            <Button
                variant="contained"
                disabled={loadDisabled}
                onClick={onLoadData}
            >
                {loading ? "Loading..." : "Load Data"}
            </Button>


            <Button
                variant="contained"
                color="success"
                disabled={submitDisabled}
                onClick={onSubmit}
            >
                {submitting ? "Submitting..." : "Submit"}
            </Button>
        </Box>
    );
}

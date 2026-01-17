import CardView from "./components/CardView";
import PageHeader from "./components/PageHeader";
import { showNotification } from "../../api/uiSlice";
import { useSelector, useDispatch } from "react-redux";
import { fetchLocations } from "../locationView/locationsSlice";
import { useEffect, useMemo, useCallback, useState } from "react";
import { fetchFrequencies } from "../FrequencyView/frequencySlice";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import {
  setSelectedSheet,
  clearEntries,
  fetchFilter,
  setEntries,
  submitCountSheet,
} from "./countsSlice";


//-----------------------------------
// :: Count View Function
//-----------------------------------

/*
A React component that loads inventory data by location and frequency, displays progress, 
and submits counts using Redux and Material UI.
*/

const CountsView = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { entries, selectedSheet, loading } = useSelector((s) => s.counts);
  const { frequencies, loading: freqLoading } = useSelector((s) => s.frequencies);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);


  //---------------------------------------
  // :: useEffect FetchLocation Function
  //---------------------------------------

  /*
  This effect fetches locations and frequencies on component mount and shows an error notification if either request fails.
  */

  useEffect(() => {
    dispatch(fetchLocations())
      .unwrap()
      .then(setLocations)
      .catch(() =>
        dispatch(showNotification({ message: "Failed to load locations", type: "error" }))
      );

    dispatch(fetchFrequencies()).catch(() =>
      dispatch(showNotification({ message: "Failed to load frequencies", type: "error" }))
    );
  }, [dispatch]);



  //-----------------------------------
  // :: handle Load Data Function
  //-----------------------------------

  /*
  This callback loads filtered data based on the selected location and frequency, updates the store with the results, 
  and handles loading state and notifications.
  */

  const handleLoadData = useCallback(async () => {
    if (!selectedLocation || !selectedFrequency) return;

    setLocalLoading(true);
    try {
      const items = await dispatch(
        fetchFilter({ location: selectedLocation, dateRange: selectedFrequency })
      ).unwrap();

      const entriesWithItem = items.map((i) => {
        const itemId = i.id;

        if (!itemId) {
          console.warn("Inventory item missing proper ID reference:", i);
        }

        return {
          ...i,
          item: itemId,
        };
      });

      dispatch(clearEntries());
      dispatch(setEntries(entriesWithItem));

      dispatch(
        setSelectedSheet({
          id: selectedLocation + "-" + selectedFrequency,
          location: selectedLocation,
          frequency: selectedFrequency,
          totalItems: entriesWithItem.length,
        })
      );

      dispatch(showNotification({ message: "Sheet loaded with items!", type: "success" }));
    } catch {
      dispatch(showNotification({ message: "Failed to load sheet", type: "error" }));
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, selectedFrequency, selectedLocation]);



  //-----------------------------------
  // :: Handle Submit Function
  //-----------------------------------

  /*
  This callback submits the count entries, shows success or error notifications, and manages the submitting state.
  */

    const handleSubmit = useCallback(async () => {
    if (!entries.length || !selectedLocation || !selectedFrequency) {
      dispatch(showNotification({ message: "Missing data or selection", type: "warning" }));
      return;
    }

    setSubmitting(true);

    try {
      // Find the count sheet ID from the selectedSheet or entries if available
      // The backend expects a sheet ID for the submit endpoint
      // In this setup, we create the sheet first in submitCountSheet thunk
      
      await dispatch(submitCountSheet()).unwrap();

      dispatch(showNotification({
        message: "Count sheet submitted! Entries added to report.",
        type: "success"
      }));

      dispatch(clearEntries());
      setSelectedLocation("");
      setSelectedFrequency("");
      dispatch(setSelectedSheet(null));
      setIsConfirmOpen(false);
    } catch (err) {
      console.error("Submission error:", err);
      dispatch(showNotification({ message: "Submission failed", type: "error" }));
    } finally {
      setSubmitting(false);
    }

  }, [dispatch, entries, selectedLocation, selectedFrequency]);


  //-----------------------------------
  // :: Progress Memo Function
  //-----------------------------------

  /*
  This memoised value calculates the percentage of entries with a positive on-hand quantity to show progress.
  */

  const progress = useMemo(() => {
    if (!entries.length) return 0;
    return Math.round((entries.filter((e) => e.on_hand_quantity > 0).length / entries.length) * 100);
  }, [entries]);


  //-----------------------------------
  // :: Return Code
  //-----------------------------------

  /*
  This JSX renders the survey count UI with location and frequency filters, load and submit actions, 
  a progress indicator, and a responsive card view displaying the entries.
  */

  return (
    <Box sx={{ pt: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 1, sm: 2 }, maxWidth: 1400, mx: "auto" }}>
      <PageHeader title="Survey Count" subtitle="Enter current inventory counts">
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap", 
          gap: 2, 
          width: { xs: "100%", md: "auto" },
          alignItems: { xs: "stretch", sm: "center" }
        }}>
          <TextField
            select
            size="small"
            label="Location"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedFrequency("");
            }}
            sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { xs: "1 1 100%", sm: "none" } }}
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
            size="small"
            label="Frequency"
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { xs: "1 1 100%", sm: "none" } }}
            disabled={freqLoading || !selectedLocation}
          >
            <MenuItem value="">Select Frequency</MenuItem>
            {frequencies.map((f) => (
              <MenuItem key={f.id} value={f.value || f.id}>
                {f.days_range}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant="contained"
              onClick={handleLoadData}
              fullWidth={isMobile}
              disabled={!selectedLocation || !selectedFrequency || localLoading}
              sx={{ flex: 1 }}
            >
              {localLoading ? "Loading..." : "Load Sheet"}
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() => setIsConfirmOpen(true)}
              fullWidth={isMobile}
              disabled={!selectedSheet || submitting}
              sx={{ flex: 1 }}
            >
              {submitting ? "Submitting..." : "Submit Count"}
            </Button>
          </Box>
        </Box>
      </PageHeader>

      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>Are you sure to submit?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Once submitted, these counts will be added to the report for this location and frequency.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} color="success" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {selectedSheet && entries.length > 0 && (
        <LinearProgress
          variant="determinate"
          value={progress}
          color={progress === 100 ? "success" : "error"}
          sx={{ height: 4, borderRadius: 1, bgcolor: "#e0e0e0", mt: 1, mb: 2 }}
        />
      )}

      <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: 1, borderColor: "divider" }}>
        <CardView data={entries} loading={loading || localLoading} />
      </Paper>
    </Box>
  );
};



//-----------------------------------
// :: Export CountView 
//-----------------------------------

/*
This exports the `CountsView` component for use in other parts of the application.
*/

export default CountsView;

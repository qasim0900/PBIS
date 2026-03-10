import CardView from "./components/CardView";
import PageHeader from "./components/PageHeader";
import { showNotification } from "../../api/uiSlice";
import { useSelector, useDispatch } from "react-redux";
import { fetchLocations } from "../locationView/locationsSlice";
import { fetchFrequencies } from "../FrequencyView/frequencySlice";
import { useEffect, useMemo, useCallback, useState } from "react";
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
// :: CountsView Function
//-----------------------------------

/*
A dashboard view that loads inventory sheets by location and frequency, tracks completion progress,
and submits completed counts to the report.
*/

const CountsView = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Local state
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Redux state
  const { entries, selectedSheet, loading } = useSelector((s) => s.counts);
  const { frequencies, loading: freqLoading } = useSelector((s) => s.frequencies);

  //-----------------------------------
  // :: Fetch Locations & Frequencies
  //-----------------------------------

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
  // :: Load Sheet Data
  //-----------------------------------

  const handleLoadData = useCallback(async () => {
    if (!selectedLocation || !selectedFrequency) return;
    setLocalLoading(true);

    try {
      const items = await dispatch(
        fetchFilter({ location: selectedLocation, dateRange: selectedFrequency })
      ).unwrap();

      const entriesWithItem = items.map((i) => ({ ...i, item: i.id || null }));

      dispatch(clearEntries());
      dispatch(setEntries(entriesWithItem));

      dispatch(
        setSelectedSheet({
          id: `${selectedLocation}-${selectedFrequency}`,
          location: selectedLocation,
          frequency: selectedFrequency,
          totalItems: entriesWithItem.length,
          entries: entriesWithItem,
        })
      );

      dispatch(
        showNotification({ message: "Inventory sheet successfully synchronized.", type: "success" })
      );
      setIsLoaded(true);
    } catch {
      dispatch(
        showNotification({
          message: "Unable to synchronize inventory sheet. Please try again.",
          type: "error",
        })
      );
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, selectedLocation, selectedFrequency]);

  //-----------------------------------
  // :: Progress Calculation
  //-----------------------------------

  const progress = useMemo(() => {
    if (!entries.length) return 0;
    const countedEntries = entries.filter((e) => e.on_hand_quantity && Number(e.on_hand_quantity) > 0).length;
    return Math.round((countedEntries / entries.length) * 100);
  }, [entries]);

  //-----------------------------------
  // :: Submit Logic
  //-----------------------------------

  const canSubmit = useMemo(() => {
    if (!isLoaded || !selectedSheet || !entries.length) return false;
    // Allow submit if at least ONE entry has a count > 0
    return entries.some((e) => e.on_hand_quantity && Number(e.on_hand_quantity) > 0);
  }, [isLoaded, selectedSheet, entries]);

  const handleSubmit = useCallback(async () => {
    // Check if at least one entry has count
    const hasAtLeastOneCount = entries.some((e) => e.on_hand_quantity && Number(e.on_hand_quantity) > 0);
    
    if (!hasAtLeastOneCount) {
      dispatch(showNotification({ 
        message: "Please enter at least one count before submitting", 
        type: "warning" 
      }));
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(submitCountSheet()).unwrap();

      dispatch(
        showNotification({
          message: "Count sheet submitted! Entries added to report.",
          type: "success",
        })
      );

      handleLoadData();
      setIsConfirmOpen(false);
    } catch {
      dispatch(showNotification({ message: "Unable to submit count sheet. Please try again.", type: "error" }));
    } finally {
      setSubmitting(false);
    }
  }, [entries, dispatch, handleLoadData]);

  //-----------------------------------
  // :: Helper variables
  //-----------------------------------

  const canLoad = selectedLocation && selectedFrequency;
  const showCard = isLoaded && selectedSheet;

  //-----------------------------------
  // :: Render
  //-----------------------------------

  return (
    <Box sx={{ pt: { xs: 1, sm: 2 }, px: { xs: 1, sm: 3 }, pb: 3, maxWidth: 1400, mx: "auto" }}>
      <PageHeader title="Survey Count" subtitle="Enter current inventory counts">
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, flexWrap: "wrap", gap: 2, alignItems: { xs: "stretch", sm: "center" } }}>
          {/* Location Select */}
          <TextField
            select
            size="small"
            label="Location"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedFrequency("");
              setIsLoaded(false);
            }}
            sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { xs: 1, sm: "none" } }}
          >
            <MenuItem value="">Select Location</MenuItem>
            {locations.map((l) => (
              <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
            ))}
          </TextField>

          {/* Inventory List Select */}
          <TextField
            select
            size="small"
            label="Inventory List"
            value={selectedFrequency}
            onChange={(e) => {
              setSelectedFrequency(e.target.value);
              setIsLoaded(false);
            }}
            sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { xs: 1, sm: "none" } }}
            disabled={freqLoading || !selectedLocation}
          >
            <MenuItem value="">Select Inventory List</MenuItem>
            {frequencies.map((f) => (
              <MenuItem key={f.id} value={f.value || f.id}>{f.frequency_name}</MenuItem>
            ))}
          </TextField>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant="contained"
              onClick={handleLoadData}
              fullWidth={isMobile}
              disabled={!canLoad || localLoading}
            >
              {localLoading ? "Loading..." : "Load Sheet"}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => setIsConfirmOpen(true)}
              fullWidth={isMobile}
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Submitting..." : "Submit Count"}
            </Button>
          </Box>
        </Box>
      </PageHeader>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {progress === 100 ? (
              "All items have been counted. Once submitted, these counts will be added to the report."
            ) : (
              <>
                <strong>Partial Submission:</strong> You have counted {entries.filter((e) => e.on_hand_quantity && Number(e.on_hand_quantity) > 0).length} out of {entries.length} items ({progress}%).
                <br /><br />
                Items without counts will be excluded from the report. Do you want to continue?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color={progress === 100 ? "success" : "warning"}>
            {progress === 100 ? "Submit All" : "Submit Partial"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress & CardView */}
      {showCard && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={progress === 100 ? "success" : progress > 0 ? "primary" : "error"}
            sx={{ height: 6, borderRadius: 1, bgcolor: "#e0e0e0", mt: 2, mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ fontSize: 14, color: "text.secondary" }}>
              Progress: {entries.filter((e) => e.on_hand_quantity && Number(e.on_hand_quantity) > 0).length} / {entries.length} items counted ({progress}%)
            </Box>
            {progress < 100 && progress > 0 && (
              <Box sx={{ fontSize: 12, color: "warning.main", fontWeight: 600 }}>
                ⚠️ Partial submission allowed
              </Box>
            )}
          </Box>
          <Paper sx={{ p: 2, borderRadius: 2, border: 1, borderColor: "divider" }} elevation={0}>
            <CardView data={selectedSheet.entries} loading={loading || localLoading} />
          </Paper>
        </>
      )}
    </Box>
  );
};

//-----------------------------------
// :: Export CountsView
//-----------------------------------

export default CountsView;
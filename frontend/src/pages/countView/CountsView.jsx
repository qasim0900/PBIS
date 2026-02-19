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
  const [locations, setLocations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const { entries, selectedSheet, loading } = useSelector((s) => s.counts);
  const { frequencies, loading: freqLoading } = useSelector((s) => s.frequencies);


  //-----------------------------------
  // :: useEffect dispatch Function
  //-----------------------------------

  /*
  Fetches locations and frequencies on load, updating state or showing an error notification on failure.
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
  // :: handleLoadData Function
  //-----------------------------------

  /*
  Loads filtered inventory data, updates the sheet state, and shows success or error notifications.
  */

  const handleLoadData = useCallback(async () => {
    if (!selectedLocation || !selectedFrequency) return;
    setLocalLoading(true);
    try {
      const items = await dispatch(
        fetchFilter({ location: selectedLocation, dateRange: selectedFrequency })
      ).unwrap();

      const entriesWithItem = items.map((i) => ({
        ...i,
        item: i.id || null,
      }));

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

      dispatch(showNotification({ message: "Sheet loaded with items!", type: "success" }));
      setIsLoaded(true);
    } catch {
      dispatch(showNotification({ message: "Unable to load sheet. Please try again.", type: "error" }));
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, selectedFrequency, selectedLocation]);


  //-----------------------------------
  // :: progress Function
  //-----------------------------------

  /*
  Calculates the completion percentage of inventory entries with a recorded count
  */

  const progress = useMemo(() => {
    if (!entries.length) return 0;
    return Math.round((entries.filter((e) => e.on_hand_quantity > 0).length / entries.length) * 100);
  }, [entries]);



  //-----------------------------------
  // :: canSubmit Function
  //-----------------------------------

  /*
  Enables submission only when the sheet is loaded and every entry has a valid count entered.
  */

  const canSubmit = useMemo(() => {
    if (!isLoaded || !selectedSheet || !entries.length) return false;

    const hasMissingCount = entries.some(
      (e) => !e.on_hand_quantity || Number(e.on_hand_quantity) <= 0
    );

    return !hasMissingCount;
  }, [isLoaded, selectedSheet, entries]);


  //-----------------------------------
  // :: handleSubmit Function
  //-----------------------------------

  /*
  Submits the count sheet if all entries are completed, then reloads the sheet and shows a success or error notification
  */

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      dispatch(showNotification({ message: "Please enter all counts before submitting", type: "warning" }));
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
  }, [dispatch, canSubmit, handleLoadData]);


  //-----------------------------------
  // :: Cont Veriables
  //-----------------------------------

  /*
  Enables loading the sheet only when a location and frequency are selected.Displays the 
  count sheet card only after data is successfully loaded
  */

  const canLoad = selectedLocation && selectedFrequency;
  const showCard = isLoaded && selectedSheet


  //-----------------------------------
  // :: Return Code
  //-----------------------------------

  /*
  Renders the inventory count UI with location/frequency selection, 
  load/submit actions, confirmation dialog, and the sheet progress card.
  */

  return (
    <Box sx={{ pt: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 1, sm: 2 }, maxWidth: 1400, mx: "auto" }}>
      <PageHeader title="Survey Count" subtitle="Enter current inventory counts">
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, flexWrap: "wrap", gap: 2, width: { xs: "100%", md: "auto" }, alignItems: { xs: "stretch", sm: "center" } }}>
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
            label="Inventory List"
            value={selectedFrequency}
            onChange={(e) => {
              setSelectedFrequency(e.target.value);
              setIsLoaded(false);
            }}
            sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { xs: "1 1 100%", sm: "none" } }}
            disabled={freqLoading || !selectedLocation}
          >
            <MenuItem value="">Select Inventory List</MenuItem>
            {frequencies.map((f) => (
              <MenuItem key={f.id} value={f.value || f.id}>
                {f.frequency_name}
              </MenuItem>
            ))}
          </TextField>

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

      {isLoaded && selectedSheet && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={progress === 100 ? "success" : "error"}
            sx={{ height: 4, borderRadius: 1, bgcolor: "#e0e0e0", mt: 1, mb: 2 }}
          />

          <Paper
            elevation={0}
            sx={{ p: 1, borderRadius: 2, border: 1, borderColor: "divider" }}
          >
            <CardView
              data={selectedSheet?.entries || []}
              loading={loading || localLoading}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

//-----------------------------------
// :: Export CountsView
//-----------------------------------

/*
"CountsView manages inventory count sheets, allowing users to load, 
edit, and submit counts for a selected location and frequency.
*/

export default CountsView;

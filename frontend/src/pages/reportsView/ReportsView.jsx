import { useDispatch, useSelector } from "react-redux";
import { listReports } from "./reportsSlice";
import ReportsViewUI from "./ReportsViewUI";
import { showNotification } from "../../api/uiSlice";
import { selectUser } from "../loginView/authSlice";
import { fetchLocations } from "../locationView/locationsSlice";
import { fetchFrequencies } from "../FrequencyView/frequencySlice";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Typography } from "@mui/material";
import ColorBadge from "../../components/ColorBadge";
const ReportsView = () => {
  const dispatch = useDispatch();
  const username = useSelector(selectUser)?.username || "User";

  const { data: reports, loading } = useSelector((state) => state.reports);

  const [locations, setLocations] = useState([]);
  const [frequencies, setFrequencies] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    dispatch(fetchLocations()).unwrap().then(setLocations);
    dispatch(fetchFrequencies()).unwrap().then(setFrequencies);
  }, [dispatch]);

  const handleLoadReports = useCallback(async () => {
    try {
      await dispatch(listReports()).unwrap();
      dispatch(showNotification({ message: "Reports loaded successfully!", type: "success" }));
    } catch (err) {
      dispatch(showNotification({ message: "Failed to load reports", type: "error" }));
    }
  }, [dispatch]);

  const rows = useMemo(() => {
    const list = reports?.results || [];
    return list.flatMap((sheet) =>
      (sheet.count_entries || []).map((entry) => ({
        id: entry.id,
        item: entry.item_detail.name,
        vendor: entry.item_detail.vendor_name,
        storage: entry.item_detail.storage_location,
        currentCount: entry.on_hand_quantity,
        status: entry.highlight_state,
        orderQuantity: entry.calculated_order_units,
        orderUnit: entry.item_detail.order_unit,
        notes: entry.notes || entry.item_detail.notes,
      }))
    );
  }, [reports]);

  const reportColumns = useMemo(() => [
    { header: "Item", render: (r) => r.item || "—" },
    { header: "Vendor", render: (r) => r.vendor || "—" },
    { header: "Storage", render: (r) => r.storage || "—" },
    {
      header: "Current Count",
      render: (r) => `${r.currentCount} ${r.orderUnit || ""}`.trim(),
    },
    {
      header: "Status",
      render: (r) => (
        <ColorBadge
          status={r.status}
          labels={{
            red: "Order Needed",
            yellow: "OK",
            green: "Over Par",
          }}
        />
      ),
    },
    {
      header: "Order Quantity",
      render: (r) =>
        Number(r.orderQuantity) > 0 ? (
          <Typography fontWeight={700} color="error.main">
            {r.orderQuantity} {r.orderUnit}
          </Typography>
        ) : (
          <Typography color="success.main">—</Typography>
        ),
    },
    { header: "Notes", render: (r) => r.notes || "—" },
  ], []);

  return (
    <ReportsViewUI
      locations={locations}
      frequencies={frequencies}
      selectedLocation={selectedLocation}
      setSelectedLocation={(val) => {
        setSelectedLocation(val);
        setSelectedFrequency("");
        setSelectedReport(null);
      }}
      selectedFrequency={selectedFrequency}
      setSelectedFrequency={(val) => {
        setSelectedFrequency(val);
        setSelectedReport(null);
      }}
      sheets={reports}
      selectedSheet={selectedReport}
      handleSheetChange={(id) => {
        const report = reports.find((r) => r.id === id);
        setSelectedReport(report);
      }}
      handleLoadSheets={handleLoadReports}
      loading={loading}
      reportColumns={reportColumns}
      data={rows}
      username={username}
    />
  );
};

export default ReportsView;

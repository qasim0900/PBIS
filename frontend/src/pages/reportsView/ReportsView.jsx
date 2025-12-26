import { useDispatch } from "react-redux";
import ReportsViewUI from "./ReportsViewUI";
import { showNotification } from "../uiSlice";
import countsAPI from "../countView/countsAPI";
import ColorBadge from "../../components/ColorBadge";
import locationsAPI from "../locationView/locationsAPI";
import { useEffect, useCallback, useState, useMemo } from "react";

const ReportsView = () => {
  const dispatch = useDispatch();

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [sheetEntries, setSheetEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------------ Locations ------------------
  const fetchLocations = useCallback(async () => {
    try {
      const res = await locationsAPI.getAll();
      setLocations(res.data?.results || res.data || []);
    } catch {
      dispatch(
        showNotification({
          message: "Failed to load locations",
          type: "error",
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // ------------------ Load Report ------------------
  const handleLoadSheets = useCallback(async () => {
    if (!selectedLocation || !selectedFrequency) return;

    setLoading(true);
    try {
      const res = await countsAPI.getTodaySheet(
        selectedLocation,
        selectedFrequency
      );

      const sheet = res.data;

      if (!sheet?.is_submitted) {
        dispatch(
          showNotification({
            message: "Sheet not submitted yet",
            type: "warning",
          })
        );
        setSheetEntries([]);
        return;
      }

      const reportRes = await countsAPI.getOrderReport(sheet.id);
      const reportData = reportRes.data;

      setSheets([sheet]);
      setSelectedSheet(sheet);
      setSheetEntries(reportData.items || []);

      dispatch(
        showNotification({
          message: "Order report loaded!",
          type: "success",
        })
      );
    } catch (err) {
      dispatch(
        showNotification({
          message: "Failed to load report",
          type: "error",
        })
      );
      setSheetEntries([]);
      setSheets([]);
      setSelectedSheet(null);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedFrequency, dispatch]);

  // ------------------ Sheet Change ------------------
  const handleSheetChange = useCallback(
    (sheetId) => {
      const sheet = sheets.find((s) => s.id === sheetId) || null;
      setSelectedSheet(sheet);
    },
    [sheets]
  );

  // ------------------ CSV Download ------------------
  const handleDownloadCSV = useCallback(() => {
    if (!sheetEntries.length) return;

    const headers = [
      "Item",
      "Vendor",
      "Storage Location",
      "Par Level",
      "Order Point",
      "Current Count",
      "Status",
      "Order Qty",
    ];

    const rows = sheetEntries.map((e) => [
      e.item?.name || "—",
      e.vendor?.name || e.override?.vendor_name || "—",
      e.storage_location || "—",
      e.par_level ?? 0,
      e.order_point ?? 0,
      e.on_hand_quantity ?? 0,
      e.highlight_state
        ? e.highlight_state.charAt(0).toUpperCase() +
        e.highlight_state.slice(1)
        : "—",
      e.calculated_order_units ?? 0,
    ]);

    const csvContent = [headers, ...rows]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-report-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    dispatch(
      showNotification({
        message: "CSV report downloaded!",
        type: "success",
      })
    );
  }, [sheetEntries, dispatch]);

  // ------------------ Print ------------------
  const handlePrint = useCallback(() => {
    if (!sheetEntries.length) return;

    const today = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const printRows = sheetEntries
      .map(
        (e) => `
      <tr>
        <td>${e.item?.name || "—"}</td>
        <td>${e.vendor?.name || e.override?.vendor_name || "—"}</td>
        <td>${e.storage_location || "—"}</td>
        <td>${e.par_level ?? 0}</td>
        <td>${e.order_point ?? 0}</td>
        <td>${e.on_hand_quantity ?? 0}</td>
        <td style="color: red; font-weight: bold;">
          ${e.highlight_display?.toUpperCase() || "—"}
        </td>
        <td>${e.calculated_order_units ?? 0}</td>
      </tr>`
      )
      .join("");

    const content = `
      <html>
        <head>
          <title>Order Replenishment Report</title>
          <style>
            body { font-family: Arial; margin: 40px; }
            h1, p { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
            th { background-color: #8b5cf6; color: white; }
          </style>
        </head>
        <body>
          <h1>Order Replenishment Report</h1>
          <p>Generated on ${today}</p>
          <p>
            Location: ${locations.find((l) => l.id == selectedLocation)?.name || ""
      } | Frequency: ${selectedFrequency}
          </p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Vendor</th>
                <th>Storage</th>
                <th>Par</th>
                <th>Order Point</th>
                <th>Current Count</th>
                <th>Status</th>
                <th>Order Quantity</th>
              </tr>
            </thead>
            <tbody>${printRows}</tbody>
          </table>
        </body>
      </html>`;

    const win = window.open("", "", "width=900,height=700");
    win.document.write(content);
    win.document.close();
    win.print();
  }, [sheetEntries, selectedLocation, selectedFrequency, locations]);

  // ------------------ Table Columns ------------------
  const reportColumns = useMemo(() => [
    { header: "Item", render: (r) => r.item?.name || "—" },
    { header: "Vendor", render: (r) => r.vendor_name || "—" },
    { header: "Storage", render: (r) => r.storage_location || "—" },
    { header: "Current Count", render: (r) => `${r.on_hand_quantity} ${r.count_unit}` },
    {
      header: "Status",
      render: (r) => (
        <ColorBadge
          status={r.highlight_state}
          labels={{
            red: "Order Needed",
            yellow: "OK",
            green: "Over Par"
          }}
        />
      ),
    },
    {
      header: "Order Quantity",
      render: (r) => r.calculated_order_units > 0
        ? `${r.calculated_order_units} ${r.order_unit}`
        : "—"
    },
  ], []);
  return (
    <ReportsViewUI
      locations={locations}
      selectedLocation={selectedLocation}
      setSelectedLocation={(val) => {
        setSelectedLocation(val);
        setSheets([]);
        setSelectedSheet(null);
        setSheetEntries([]);
      }}
      selectedFrequency={selectedFrequency}
      setSelectedFrequency={(val) => {
        setSelectedFrequency(val);
        setSheets([]);
        setSelectedSheet(null);
        setSheetEntries([]);
      }}
      sheets={sheets}
      selectedSheet={selectedSheet}
      handleSheetChange={handleSheetChange}
      handleLoadSheets={handleLoadSheets}
      handleDownloadCSV={handleDownloadCSV}
      handlePrint={handlePrint}
      loading={loading}
      reportColumns={reportColumns}
      data={sheetEntries}
    />
  );
};

export default ReportsView;

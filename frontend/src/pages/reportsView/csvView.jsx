export const downloadCSVReport = (sheetEntries, dispatch, showNotification, metadata = {}) => {
  if (!sheetEntries?.length) {
    dispatch(showNotification({ message: "No data to export", type: "warning" }));
    return;
  }

  const { location, frequency } = metadata;

  const headers = [
    "Item",
    "Vendor",
    "Storage Location",
    "Par Level",
    "Order Point",
    "Current Count",
    "Status",
    "Order Quantity",
    "Notes",
  ];

  const rows = sheetEntries.map(e => {
    const orderUnits = Number(e.orderQuantity) || 0;
    const unit = e.orderUnit || "";
    const orderText = orderUnits ? `${orderUnits} ${unit}` : "—";
    return [
      e.item || "—",
      e.vendor || "—",
      e.storage || "—",
      e.par_level ?? "—",
      e.order_point ?? "—",
      e.currentCount ?? 0,
      e.status || "—",
      orderText,
      e.notes || "—",
    ];
  });

  const metadataRows = [];
  if (location) {
    metadataRows.push(["Location", location]);
  }
  if (frequency) {
    metadataRows.push(["Inventory List", frequency]);
  }
  if (metadataRows.length > 0) {
    metadataRows.push([]);
  }

  const csv = [...metadataRows, headers, ...rows]
    .map(row =>
      row.map(col => `"${String(col).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `order-report-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  dispatch(
    showNotification({
      message: "CSV report downloaded successfully!",
      type: "success",
    })
  );
};

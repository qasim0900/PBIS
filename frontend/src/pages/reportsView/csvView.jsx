//---------------------------------------
// :: downloadCSV Report Funcation
//---------------------------------------


/*
Exports a function that converts sheet entries into a CSV file, triggers a 
download, and displays success or warning notifications.
*/

export const downloadCSVReport = (sheetEntries, dispatch, showNotification, metadata = {}) => {
  if (!sheetEntries?.length) {
    dispatch(showNotification({ message: "No data to export", type: "warning" }));
    return;
  }

  // Extract metadata
  const { location, frequency } = metadata;


  //---------------------------------------
  // :: headers List
  //---------------------------------------


  /*
  Defines the CSV column headers for the inventory order report export.
  */

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


  //---------------------------------------
  // :: Row map Function
  //---------------------------------------


  /*
  Transforms each entry into a formatted CSV row, including a readable order quantity string.
  */

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


  //---------------------------------------
  // :: CSV Map Function
  //---------------------------------------


  /*
  Generates a CSV file from the provided data, triggers a browser download, and displays a success notification.
  */

  // Create metadata rows
  const metadataRows = [];
  if (location) {
    metadataRows.push(["Location", location]);
  }
  if (frequency) {
    metadataRows.push(["Inventory List", frequency]);
  }
  if (metadataRows.length > 0) {
    metadataRows.push([]); // Empty row to separate metadata from data
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

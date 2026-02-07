//---------------------------------------
// :: print Report Funcation
//---------------------------------------


/*
Generates a formatted HTML order replenishment report for the selected location, opens it in a new window for printing, 
and displays a notification based on the outcome.
*/

export const printReport = (
  sheetEntries,
  locations,
  selectedLocation,
  username,
  dispatch,
  showNotification
) => {
  if (!sheetEntries?.length) return;

  const today = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const locationName =
    locations.find(l => l.id == selectedLocation)?.name || "Unknown";

  const rows = sheetEntries.map(e => {
    const par = Number(e.par_level) || 0;
    const orderPoint = Number(e.order_point) || 0;
    const current = Number(e.currentCount) || 0;

    const orderQty = Number(e.orderQuantity) || 0;
    const unit = e.orderUnit || "unit";
    const plural = orderQty === 1 ? "" : "s";

    const orderText = orderQty
      ? `<strong style="color:#dc2626;">${orderQty} ${unit}${plural}</strong>`
      : "—";

    const statusColor =
      e.status === "red"
        ? "#dc2626"
        : e.status === "yellow"
          ? "#f59e0b"
          : "#16a34a";

    return `
      <tr>
        <td>${e.item || "—"}</td>
        <td>${e.vendor || "—"}</td>
        <td>${e.storage || "—"}</td>
        <td>${par}</td>
        <td>${orderPoint}</td>
        <td>${current}</td>
        <td style="font-weight:bold;color:${statusColor}">
          ${e.status?.toUpperCase() || "—"}
        </td>
        <td>${orderText}</td>
        <td>${e.notes || "—"}</td>
      </tr>
    `;
  }).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Order Replenishment Report</title>
<style>
body{font-family:Arial;margin:40px;color:#1e293b}
h1{font-size:28px}
table{width:100%;border-collapse:collapse;margin-top:30px}
th{background:#8b5cf6;color:#fff;padding:14px}
td{padding:12px;border:1px solid #e2e8f0;text-align:center}
.footer{margin-top:60px;text-align:center;font-size:13px;color:#64748b}
</style>
</head>
<body>
<h1>Order Replenishment Report</h1>
<p><strong>Generated:</strong> ${today}</p>
<p><strong>Location:</strong> ${locationName}</p>

<table>
<thead>
<tr>
<th>Item</th>
<th>Vendor</th>
<th>Storage</th>
<th>Par</th>
<th>Order Point</th>
<th>Current</th>
<th>Status</th>
<th>Order Qty</th>
<th>Notes</th>
</tr>
</thead>
<tbody>${rows}</tbody>
</table>

<div class="footer">
<p>Purple Banana Inventory System © 2026</p>
<p>Printed by: ${username}</p>
</div>
</body>
</html>`;

  const win = window.open("", "", "width=1100,height=800");
  if (!win) {
    dispatch(showNotification({ message: "Allow popups for printing", type: "warning" }));
    return;
  }

  win.document.write(html);
  win.document.close();
  win.focus();

  dispatch(showNotification({ message: "Report sent to printer!", type: "success" }));
};

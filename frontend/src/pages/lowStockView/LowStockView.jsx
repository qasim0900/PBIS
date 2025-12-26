import * as XLSX from 'xlsx';
import { showNotification } from '../uiSlice';
import { Button, Stack } from '@mui/material';
import LowStockViewUI from './LowStockViewUI';
import { useEffect, useCallback } from 'react';
import { selectUser } from '../loginView/authSlice';
import { Print, Download } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLowStockEntries } from '../countView/countsSlice';


const LowStockView = () => {
  const dispatch = useDispatch();

  const {
    lowStock: items = [],
    loading,
    error,
  } = useSelector((state) => state.counts);

  const user = useSelector(selectUser);
  const userName = user?.username || 'Unknown User';
  const userRole = user?.role || '-';

  const fetchLowStock = useCallback(() => {
    dispatch(fetchLowStockEntries())
      .unwrap()
      .catch(() => {
        dispatch(
          showNotification({
            message: 'Failed to fetch low stock items',
            type: 'error',
          })
        );
      });
  }, [dispatch]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);
  const transformedItems = items.map((item) => ({
    item: { name: item.Item },
    vendor: item.Vendor ? { name: item.Vendor } : null,
    location: item.Location,
    on_hand_quantity: item.On_Hand,
    calculated_qty_to_order: item.Order_Qty,
    highlight_state:
      item.Status?.toLowerCase() === 'low' ? 'near_par' :
        item.Status?.toLowerCase() === 'critical' ? 'critical' :
          'ok',
  }));

  const criticalCount = items.filter(
    (i) => i.highlight_state === 'low' || i.highlight_state === 'critical'
  ).length;

  const lowCount = items.filter(
    (i) => i.highlight_state === 'near_par'
  ).length;


  const handleExportExcel = () => {
    if (!items.length) return;

    const dataForExcel = items.map((item) => ({
      'Item Name': item.item?.name || 'Unknown',
      Category: item.item?.category_display || 'Uncategorized',
      Vendor: item.vendor?.name ?? item.override?.vendor_name ?? 'N/A',
      Location: item.location ?? 'N/A',
      'On Hand Qty': Number(item.on_hand_quantity ?? 0),
      'Par Level': Number(item.par_level ?? item.override?.par_level ?? 0),
      'Order Qty': Number(item.calculated_qty_to_order ?? 0),
      Status:
        item.highlight_state === 'low' || item.highlight_state === 'critical'
          ? 'Critical'
          : 'Low Stock',
    }));

    const wb = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['Low Stock Replenishment Report'],
      [''],
      ['Generated On', new Date().toLocaleString()],
      ['Prepared By', `${userName} (${userRole})`],
      [''],
      ['Critical Items', criticalCount],
      ['Low Stock Items', lowCount],
      ['Total Items', items.length],
    ]);

    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    const dataSheet = XLSX.utils.json_to_sheet(dataForExcel);
    XLSX.utils.book_append_sheet(wb, dataSheet, 'Low Stock Items');

    XLSX.writeFile(
      wb,
      `LowStock_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    dispatch(
      showNotification({
        message: 'Excel report exported successfully!',
        type: 'success',
      })
    );
  };

  const handlePrintReport = () => {
    if (!items.length) return;

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Low Stock Report</title></head>
        <body>
          <h2>Low Stock Report</h2>
          <pre>${JSON.stringify(items, null, 2)}</pre>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const headerActions = (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" startIcon={<Print />} onClick={handlePrintReport}>
        Print
      </Button>
      <Button variant="contained" startIcon={<Download />} onClick={handleExportExcel}>
        Export Excel
      </Button>
    </Stack>
  );

  return (
    <>
      <LowStockViewUI
        items={transformedItems}
        loading={loading}
        error={error}
        criticalCount={criticalCount}
        lowCount={lowCount}
        headerActions={headerActions}
      />
    </>
  );
};

export default LowStockView;

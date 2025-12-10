import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Collapse,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  Warning,
  Error,
  CheckCircle,
  Print,
  Download,
  Inventory,
} from '@mui/icons-material';
import Header from '../components/Header';
import Table from '../components/Table';
import { showNotification } from '../store/slices/uiSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { selectUser } from '../store/slices/authSlice';

// Import Redux thunks and selectors
import { fetchLowStockEntries } from '../store/slices/countsSlice';

const LowStockView = () => {
  const dispatch = useDispatch();

  // Redux state
  const { lowStock: items, loading, error } = useSelector(state => state.counts);
  const user = useSelector(selectUser);
  const userName = user?.username || "Unknown User";
  const userRole = user?.role || "N/A";
  // Fetch low stock entries on mount
  const fetchLowStock = useCallback(() => {
    dispatch(fetchLowStockEntries())
      .unwrap()
      .catch(() => {
        dispatch(showNotification({ message: 'Failed to fetch low stock items', type: 'error' }));
      });
  }, [dispatch]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  const getStatusInfo = (highlight) => {
    switch (highlight) {
      case 'low':
        return { color: 'error', label: 'Critical', icon: <Error fontSize="small" /> };
      case 'near_par':
        return { color: 'warning', label: 'Low', icon: <Warning fontSize="small" /> };
      default:
        return { color: 'success', label: 'OK', icon: <CheckCircle fontSize="small" /> };
    }
  };

  const criticalCount = items.filter(i => i.highlight === 'low').length;
  const lowCount = items.filter(i => i.highlight === 'near_par').length;

  // Table columns
  const columns = [
    {
      header: "Item",
      accessor: "item.name",
      render: (row) => {
        const status = getStatusInfo(row.highlight);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: `${status.color}.light`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory sx={{ color: `${status.color}.main`, fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {row.item?.name ?? "Unknown"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.item?.category ?? "General"}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      header: "Location",
      accessor: "location",
      render: (row) => (
        <Chip label={row.location || "N/A"} size="small" variant="outlined" />
      )
    },
    {
      header: "On Hand",
      accessor: "on_hand_quantity",
      align: "center",
      render: (row) => (
        <Typography variant="h6" fontWeight={600} color={row.on_hand_quantity < 5 ? "error" : "text.primary"}>
          {row.on_hand_quantity}
        </Typography>
      )
    },
    {
      header: "Par Level",
      accessor: "item.par_level",
      align: "center",
      render: (row) => row?.par_level ?? "N/A"
    },
    {
      header: "Order Qty",
      accessor: "calculated_qty_to_order",
      align: "center",
      render: (row) => (
        <Typography variant="h6" fontWeight={700} color="error.main">
          {row.calculated_qty_to_order ?? 0}
        </Typography>
      )
    },
    {
      header: "Status",
      accessor: "highlight",
      align: "center",
      render: (row) => {
        const status = getStatusInfo(row.highlight);
        return <Chip icon={status.icon} label={status.label} color={status.color} size="small" />;
      }
    },
  ];

  // Export Excel
  const handleExportExcel = () => {
    const dataForExcel = items.map(item => ({
      'Item Name': item.item?.name || 'Unknown',
      'Category': item.item?.category_display || 'Uncategorized',
      'Storage Location': item.storage_location || 'Not Specified',
      'On Hand Qty': item.on_hand_quantity || 0,
      'Order Point': item.order_point || 0,
      'Par Level': item.par_level || 0,
      'Qty to Order': item.calculated_qty_to_order || 0,
      'Frequency': item.frequency_display || 'Not Set',
      'Status': item.highlight_display || (item.highlight === 'low' ? 'Critical' : 'Low Stock')
    }));

    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summary = [
      ["Low Stock Replenishment Report"],
      [""],
      ["Generated On", new Date().toLocaleString()],
      ["Prepared By", `${userName} (${userRole})`],
      [""],
      ["Summary"],
      ["Critical Items", criticalCount],
      ["Low Stock Items", lowCount],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summary);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Data Sheet
    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    ws['!cols'] = [30, 18, 22, 12, 12, 12, 12, 15, 14].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Low Stock Items");

    const fileName = `PurpleBanana_LowStock_${new Date().toISOString().slice(0, 10)}_by_${userName.replace(/\s+/g, '')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    dispatch(showNotification({ message: "Excel report exported successfully!", type: "success" }));
  };
  // Export PDF
  // Export PDF - Super Professional Report (Recommended)
  // Export PDF - Top Center Professional Layout
  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const today = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 1. Top Center - Main Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(139, 92, 246); // Purple
    const title = "Low Stock Replenishment Report";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 30);

    // 2. Generated By - Center
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    const generatedText = `Generated by: ${userName} (${userRole}) on ${today}`;
    const genTextWidth = doc.getTextWidth(generatedText);
    doc.text(generatedText, (pageWidth - genTextWidth) / 2, 42);

    // Optional: Small divider line
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 48, pageWidth - 20, 48);

    // 3. Table starts after good margin (55mm from top)
    autoTable(doc, {
      head: [['Item Name', 'Category', 'Location', 'On Hand', 'Order Pt', 'Par', 'Order Qty', 'Frequency', 'Status']],
      body: items.map(item => [
        item.item?.name || 'Unknown',
        item.item?.category_display || '—',
        item.storage_location || '—',
        item.on_hand_quantity || 0,
        item.order_point || 0,
        item.par_level || 0,
        { content: item.calculated_qty_to_order || 0, styles: { fontStyle: 'bold', textColor: [220, 38, 38] } },
        item.frequency_display || '—',
        {
          content: item.highlight_display || (item.highlight === 'low' ? 'Critical' : 'Low Stock'),
          styles: {
            fillColor: item.highlight === 'low' ? [239, 68, 68] : [251, 191, 36],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          }
        }
      ]),
      startY: 55, // Yeh margin aapke hisab se perfect hai
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9.5,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [250, 249, 255]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 24 },
        2: { cellWidth: 28 },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38] },
        7: { halign: 'center' },
        8: { halign: 'center' }
      },
      margin: { top: 55, left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        const footerY = pageHeight - 12;
        doc.text(`Purple Banana Inventory System • ${new Date().getFullYear()} • Page ${doc.getCurrentPageInfo().pageNumber}`, 14, footerY);
      }
    });

    // Save
    const fileName = `PurpleBanana_LowStock_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);

    dispatch(showNotification({ message: "Professional PDF report generated!", type: "success" }));
  };
  // Print function stays the same as before

  return (
    <Box>
      <Header
        title="Low Stock Alert"
        subtitle="Items that need to be reordered"
        showRefresh
        onRefresh={fetchLowStock}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" startIcon={<Print />}>Print</Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleExportPDF} sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Export PDF</Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleExportExcel} sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>Export Excel</Button>
        </Stack>
      </Header>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {criticalCount > 0 && <Alert severity="error" sx={{ mb: 3 }}> <strong>{criticalCount} items are critically low</strong> </Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700}>{criticalCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h3" fontWeight={700}>{lowCount}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h3" fontWeight={700} color="primary">{items.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      {loading ? (
        <Card>
          <CardContent>
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 2 }} />)}
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600}>All items are well stocked!</Typography>
          </CardContent>
        </Card>
      ) : (
        <Collapse in={true}>
          <Table columns={columns} data={items} searchable={true} />
        </Collapse>
      )}
    </Box>
  );
};

export default LowStockView;

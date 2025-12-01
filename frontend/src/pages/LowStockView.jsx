import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
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
} from '@mui/material';

import {
  TrendingDown,
  Warning,
  Error,
  CheckCircle,
  Print,
  Download,
  Inventory,
} from '@mui/icons-material';

import Header from '../components/Header';
import countsAPI from '../services/countsAPI';
import { showNotification } from '../store/slices/uiSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Table from '../components/Table';

const LowStockView = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = useCallback(async () => {
    try {
      const response = await countsAPI.getLowStock();
      setItems(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
      dispatch(showNotification({ message: 'Failed to fetch low stock items', type: 'error' }));
    } finally {
      setLoading(false);
    }
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

  // ------------- TABLE COLUMNS ----------------
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
        <Chip
          label={row.location || "N/A"}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      header: "On Hand",
      accessor: "on_hand_quantity",
      align: "center",
      render: (row) => (
        <Typography
          variant="h6"
          fontWeight={600}
          color={row.on_hand_quantity < 5 ? "error" : "text.primary"}
        >
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
        return (
          <Chip
            icon={status.icon}
            label={status.label}
            color={status.color}
            size="small"
          />
        );
      }
    },
  ];

const handleExportExcel = () => {
    const dataForExcel = items.map(item => ({
      'Item': item.item?.name || 'Unknown',
      'Category': item.item?.category || 'General',
      'Location': item.location || 'N/A',
      'On Hand': item.on_hand_quantity,
      'Par Level': item.item?.par_level || 0,
      'To Order': item.qty_to_order || 0,
      'Status': item.highlight === 'low' ? 'Critical' : 'Low'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    
    // Column width set karo
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, 
      { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Low Stock");
    XLSX.writeFile(wb, `PurpleBanana_LowStock_${new Date().toISOString().slice(0,10)}.xlsx`);

    dispatch(showNotification({ message: "Excel exported successfully!", type: "success" }));
  };

  // PDF Export (Beautiful, Print-Ready PDF)
  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(139, 92, 246);
    doc.text("Purple Banana", 20, 25);
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Low Stock Alert Report", 20, 35);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${today}`, 20, 45);
    doc.text(`Critical Items: ${criticalCount} | Low Items: ${lowCount}`, 20, 52);

    // Table
    autoTable(doc, {
      head: [['Item', 'Location', 'On Hand', 'Par', 'To Order', 'Status']],
      body: items.map(item => [
        item.item?.name || 'Unknown',
        item.location || 'N/A',
        item.on_hand_quantity,
        item.item?.par_level || '-',
        item.qty_to_order || 0,
        item.highlight === 'low' ? 'Critical' : 'Low'
      ]),
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 11 },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 247, 255] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38] },
        5: { halign: 'center' }
      }
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Purple Banana Inventory System © 2025", 20, doc.lastAutoTable.finalY + 15);

    doc.save(`PurpleBanana_LowStock_${new Date().toISOString().slice(0,10)}.pdf`);
    dispatch(showNotification({ message: "PDF exported successfully!", type: "success" }));
  };

  // Print Function (Beautiful Print Layout)
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purple Banana - Low Stock Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; background: white; color: #333; }
          h1 { color: #8b5cf6; }
          h2 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #8b5cf6; color: white; }
          .critical { background: #fee2e2; font-weight: bold; }
          .low { background: #fef3c7; }
          .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Purple Banana</h1>
        <h2>Low Stock Alert Report</h2>
        <p><strong>Generated:</strong> ${today}</p>
        <p><strong>Critical Items:</strong> ${criticalCount} | <strong>Low Items:</strong> ${lowCount}</p>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Location</th>
              <th>On Hand</th>
              <th>Par</th>
              <th>To Order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr class="${item.highlight === 'low' ? 'critical' : 'low'}">
                <td><strong>${item.item?.name || 'Unknown'}</strong><br><small>${item.item?.category || ''}</small></td>
                <td>${item.location || 'N/A'}</td>
                <td style="text-align:center">${item.on_hand_quantity}</td>
                <td style="text-align:center">${item.item?.par_level || '-'}</td>
                <td style="text-align:center; color:red; font-weight:bold">${item.qty_to_order || 0}</td>
                <td style="text-align:center">${item.highlight === 'low' ? 'Critical' : 'Low'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Purple Banana Inventory System © 2025</div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Box>
      <Header
        title="Low Stock Alert"
        subtitle="Items that need to be reordered"
        showRefresh
        onRefresh={fetchLowStock}
      >
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
          sx={{ mr: 1 }}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExportPDF}
          sx={{ mr: 1, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
        >
          Export PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExportExcel}
          sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          Export Excel
        </Button>
      </Header>

      {criticalCount > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>{criticalCount} items are critically low</strong> and need immediate attention!
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Error />
              <Typography variant="overline">Critical</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{criticalCount}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Warning />
              <Typography variant="overline">Low Stock</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{lowCount}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingDown color="primary" />
              <Typography variant="overline" color="text.secondary">Total Alerts</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} color="primary">{items.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* ----------- TABLE SECTION ------------- */}
      {loading ? (
        <Card>
          <CardContent>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 2 }} />
            ))}
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              All items are well stocked!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No items require immediate reordering at this time.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Collapse in={true}>
          <div>
            <Table
              columns={columns}
              data={items}
              searchable={true}
            />
          </div>
        </Collapse>
      )}
    </Box>
  );
};

export default LowStockView;

import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Download,
  Assessment,
  PictureAsPdf,
  TableChart,
  CalendarToday,
  LocationOn,
  Person,
} from '@mui/icons-material';
import Header from '../components/Header';
import reportsAPI from '../services/reportsAPI';
import { showNotification } from '../store/slices/uiSlice';

const ReportsView = () => {
  const dispatch = useDispatch();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const response = await reportsAPI.getAll();
      setReports(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      dispatch(showNotification({ message: 'Failed to fetch reports', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  

  const handleDownload = (report) => {
    if (report.file_path) {
      window.open(report.file_path, '_blank');
    }
    dispatch(showNotification({ message: 'Downloading report...', type: 'info' }));
  };

  const getFormatIcon = (format) => {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return <PictureAsPdf />;
      case 'csv':
      case 'excel':
        return <TableChart />;
      default:
        return <Assessment />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Header 
        title="Reports" 
        subtitle="View and download generated reports"
        showRefresh
        onRefresh={fetchReports}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Generate Report
        </Button>
      </Header>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Assessment />
              <Typography variant="overline">Total Reports</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700}>{reports.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PictureAsPdf color="error" />
              <Typography variant="overline" color="text.secondary">PDF Reports</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} color="error.main">
              {reports.filter(r => r.format === 'pdf').length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TableChart color="success" />
              <Typography variant="overline" color="text.secondary">Excel Reports</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} color="success.main">
              {reports.filter(r => r.format === 'excel' || r.format === 'csv').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Assessment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No reports generated yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Generate your first report to track inventory trends
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              Generate First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Fade in={true}>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Generated By</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              backgroundColor: 'primary.light',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {getFormatIcon(report.format)}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Inventory Report
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(report.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<LocationOn fontSize="small" />}
                          label={report.location_name || 'All Locations'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getFormatIcon(report.format)}
                          label={(report.format || 'PDF').toUpperCase()}
                          size="small"
                          color={report.format === 'pdf' ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2">
                            {report.generated_by_username || 'System'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton
                            color="primary"
                            onClick={() => handleDownload(report)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>
      )}
    </Box>
  );
};

export default ReportsView;

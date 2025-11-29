import { useState, useEffect, useRef, useCallback } from 'react';
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
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Skeleton,
  Fade,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Category,
  Inventory,
  FilterList,
  FileDownload,
  FileUpload,
  Description,
  MoreVert,
} from '@mui/icons-material';
import Header from '../components/Header';
import catalogAPI from '../services/catalogAPI';
import { showNotification } from '../store/slices/uiSlice';

const CATEGORIES = [
  { value: 'fruit', label: 'Fruit', color: '#10b981' },
  { value: 'dairy', label: 'Dairy', color: '#3b82f6' },
  { value: 'dry', label: 'Dry Goods', color: '#f59e0b' },
  { value: 'packaging', label: 'Packaging', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#64748b' },
];

const CatalogView = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'fruit',
    count_unit: 'bags',
    order_unit: 'case',
    pack_size: 1,
    is_active: true,
  });

  const fetchItems = useCallback(async () => {
    try {
      const response = await catalogAPI.getAll();
      setItems(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      dispatch(showNotification({ message: 'Failed to fetch items', type: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await catalogAPI.update(editingItem.id, formData);
        dispatch(showNotification({ message: 'Item updated successfully', type: 'success' }));
      } else {
        await catalogAPI.create(formData);
        dispatch(showNotification({ message: 'Item created successfully', type: 'success' }));
      }
      fetchItems();
      closeModal();
    } catch (error) {
      console.error('Failed to save item:', error);
      dispatch(showNotification({ message: 'Failed to save item', type: 'error' }));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      count_unit: item.count_unit,
      order_unit: item.order_unit,
      pack_size: item.pack_size,
      is_active: item.is_active,
    });
    setModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await catalogAPI.delete(deletingItem.id);
      dispatch(showNotification({ message: 'Item deleted successfully', type: 'success' }));
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      dispatch(showNotification({ message: 'Failed to delete item', type: 'error' }));
    } finally {
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'fruit',
      count_unit: 'bags',
      order_unit: 'case',
      pack_size: 1,
      is_active: true,
    });
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await catalogAPI.exportExcel();
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'catalog_items.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      dispatch(showNotification({ message: 'Excel file exported successfully', type: 'success' }));
    } catch (error) {
      console.error('Failed to export Excel file:', error);
      dispatch(showNotification({ message: 'Failed to export Excel file', type: 'error' }));
    } finally {
      setExporting(false);
      setAnchorEl(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await catalogAPI.downloadTemplate();
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'catalog_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      dispatch(showNotification({ message: 'Template downloaded successfully', type: 'success' }));
    } catch (error) {
      console.error('Failed to download template:', error);
      dispatch(showNotification({ message: 'Failed to download template', type: 'error' }));
    }
    setAnchorEl(null);
  };

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
    setSelectedFile(null);
    setImportResult(null);
    setAnchorEl(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        dispatch(showNotification({ message: 'Please select an Excel file (.xlsx or .xls)', type: 'error' }));
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      dispatch(showNotification({ message: 'Please select a file first', type: 'error' }));
      return;
    }

    setImporting(true);
    try {
      const response = await catalogAPI.importExcel(selectedFile);
      setImportResult(response.data);
      if (response.data.success) {
        dispatch(showNotification({ 
          message: `Import complete: ${response.data.created} created, ${response.data.updated} updated`, 
          type: 'success' 
        }));
        fetchItems();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to import Excel file';
      dispatch(showNotification({ message: errorMessage, type: 'error' }));
      setImportResult({ success: false, error: errorMessage });
    } finally {
      setImporting(false);
    }
  };

  const closeImportDialog = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  const getCategoryColor = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || '#64748b';
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <Header 
        title="Catalog Items" 
        subtitle={`Manage your inventory catalog (${items.length} items)`}
        showRefresh
        onRefresh={fetchItems}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {!isMobile && (
            <>
              <Button
                variant="outlined"
                startIcon={exporting ? <CircularProgress size={16} /> : <FileDownload />}
                onClick={handleExportExcel}
                disabled={exporting}
                size="small"
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileUpload />}
                onClick={handleOpenImportDialog}
                size="small"
              >
                Import
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? 'Add' : 'Add Item'}
          </Button>
          {isMobile && (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={handleExportExcel} disabled={exporting}>
                  <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                  <ListItemText>Export Excel</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleOpenImportDialog}>
                  <ListItemIcon><FileUpload fontSize="small" /></ListItemIcon>
                  <ListItemText>Import Excel</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDownloadTemplate}>
                  <ListItemIcon><Description fontSize="small" /></ListItemIcon>
                  <ListItemText>Download Template</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Header>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search items..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: isMobile ? '100%' : 250, flex: isMobile ? 1 : 'none' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: isMobile ? '100%' : 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList color="action" />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </TextField>
          <Chip 
            label={`${filteredItems.length} items found`} 
            variant="outlined" 
            size="small"
          />
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Fade in={true}>
          <Card>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    {!isMobile && <TableCell>Category</TableCell>}
                    {!isMobile && <TableCell>Count Unit</TableCell>}
                    {!isMobile && <TableCell>Order Unit</TableCell>}
                    <TableCell align="center">Pack Size</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: isMobile ? 32 : 40,
                              height: isMobile ? 32 : 40,
                              borderRadius: 2,
                              backgroundColor: `${getCategoryColor(item.category)}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Inventory sx={{ color: getCategoryColor(item.category), fontSize: isMobile ? 16 : 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                              {item.name}
                            </Typography>
                            {isMobile && (
                              <Typography variant="caption" color="text.secondary">
                                {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Chip
                            label={CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                            size="small"
                            sx={{
                              backgroundColor: `${getCategoryColor(item.category)}20`,
                              color: getCategoryColor(item.category),
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                      )}
                      {!isMobile && <TableCell>{item.count_unit}</TableCell>}
                      {!isMobile && <TableCell>{item.order_unit}</TableCell>}
                      <TableCell align="center">
                        <Chip label={item.pack_size} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={item.is_active ? 'success' : 'default'}
                          variant={item.is_active ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(item)} color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteClick(item)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 4 : 7} align="center" sx={{ py: 6 }}>
                        <Category sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No items found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>
      )}

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ pb: 1 }}>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                fullWidth
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Count Unit"
                  value={formData.count_unit}
                  onChange={(e) => setFormData({ ...formData, count_unit: e.target.value })}
                  placeholder="e.g., bags"
                  required
                />
                <TextField
                  label="Order Unit"
                  value={formData.order_unit}
                  onChange={(e) => setFormData({ ...formData, order_unit: e.target.value })}
                  placeholder="e.g., case"
                  required
                />
              </Box>
              <TextField
                label="Pack Size"
                type="number"
                value={formData.pack_size}
                onChange={(e) => setFormData({ ...formData, pack_size: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
                required
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeModal} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialogOpen} onClose={closeImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Import Excel File</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Upload an Excel file (.xlsx or .xls) to import catalog items. 
              Items with the same name will be updated, new names will create new items.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Description />}
                onClick={handleDownloadTemplate}
                size="small"
              >
                Download Template
              </Button>
            </Box>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: selectedFile ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: selectedFile ? 'primary.50' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <FileUpload sx={{ fontSize: 48, color: selectedFile ? 'primary.main' : 'grey.400', mb: 1 }} />
              {selectedFile ? (
                <Typography variant="body1" color="primary">
                  {selectedFile.name}
                </Typography>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Click to browse or drag and drop your Excel file here
                </Typography>
              )}
            </Box>

            {importResult && (
              <Alert 
                severity={importResult.success ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {importResult.success ? (
                  <>
                    Import successful: {importResult.created} items created, {importResult.updated} items updated.
                    {importResult.errors && importResult.errors.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="error">
                          Warnings: {importResult.errors.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  importResult.error || 'Import failed'
                )}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeImportDialog} color="inherit">
            {importResult?.success ? 'Close' : 'Cancel'}
          </Button>
          {!importResult?.success && (
            <Button 
              onClick={handleImportExcel} 
              variant="contained" 
              disabled={!selectedFile || importing}
              startIcon={importing ? <CircularProgress size={16} /> : <FileUpload />}
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogView;

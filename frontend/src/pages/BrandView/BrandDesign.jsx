import TableView from '../../components/template';
import { Add, Close } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    MenuItem,
} from '@mui/material';

//---------------------------------------
// :: BrandDesign Component
//---------------------------------------
export default function BrandDesign({
    brands,
    vendors,
    loading,
    open,
    editing,
    formData,
    setFormData,
    openDialog,
    closeDialog,
    handleSubmit,
}) {
    //---------------------------------------
    // :: Form Update Handler
    //---------------------------------------
    const updateForm = (key) => (e) =>
        setFormData({ ...formData, [key]: e.target?.value ?? e });

    //---------------------------------------
    // :: Table Columns Configuration
    //---------------------------------------
    const columns = [
        { header: 'Name', render: (r) => r.name },
        { 
            header: 'Vendor', 
            render: (r) => {
                const vendor = vendors?.find(v => v.id === r.vendor);
                return vendor ? vendor.name : '—';
            } 
        },
        { header: 'Description', render: (r) => r.description || '—' },
    ];

    //---------------------------------------
    // :: Table Row Actions
    //---------------------------------------
    const actions = (row) => (
        <Button size="small" variant="outlined" onClick={() => openDialog(row)}>
            Edit
        </Button>
    );

    //---------------------------------------
    // :: Component Render
    //---------------------------------------
    return (
        <>
            {/* Brand Table */}
            <TableView
                title="Brands"
                subtitle={`Manage brands (${brands.length})`}
                columns={columns}
                data={brands}
                actions={actions}
                loading={loading}
                searchable
                showRefresh
                onRefresh={() => window.location.reload()}
                extraHeaderActions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => openDialog()}
                    >
                        Add Brand
                    </Button>
                }
            />

            {/* Create/Edit Brand Dialog */}
            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Brand' : 'Add Brand'}
                    <IconButton
                        onClick={closeDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    noValidate
                >
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            {/* Name */}
                            <TextField
                                label="Brand Name *"
                                value={formData.name}
                                onChange={updateForm('name')}
                                fullWidth
                                autoFocus
                            />

                            {/* Vendor Dropdown */}
                            <TextField
                                select
                                label="Vendor *"
                                value={formData.vendor || ''}
                                onChange={updateForm('vendor')}
                                fullWidth
                            >
                                {vendors?.map((vendor) => (
                                    <MenuItem key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Description */}
                            <TextField
                                label="Description"
                                multiline
                                rows={3}
                                value={formData.description || ''}
                                onChange={updateForm('description')}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {editing ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

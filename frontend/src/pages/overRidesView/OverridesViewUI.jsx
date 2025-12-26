import TableView from '../../components/template';
import OverrideForm from '../../components/forms/OverrideForm';
import { Add, Close, Inventory, Schedule } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';




const OverridesViewUI = ({
    items,
    loading,
    locations,
    catalogItems,
    open,
    editing,
    formData,
    onChangeFormData,
    onOpenDialog,
    onCloseDialog,
    onSubmit,
}) => {
    const columns = [
        {
            header: 'Item',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Inventory color="primary" />
                    <Box sx={{ fontWeight: 600 }}>{row.item_name}</Box>
                </Box>
            ),
        },
        {
            header: 'Vendor',
            render: (row) => <Box sx={{ color: row.vendor_name ? 'text.primary' : 'text.secondary' }}>
                {row.vendor_name || '-'}
            </Box>,
            align: 'center',
        },
        {
            header: 'Par Level',
            render: (row) => row.par_level,
            align: 'center',
        },
        {
            header: 'Order Point',
            render: (row) => row.order_point,
            align: 'center',
        },
        {
            header: 'Count',
            render: (row) => row.count ?? 1,
            align: 'center',
        },
        {
            header: 'Frequency',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="small" />
                    {row.frequency || 'weekly'}
                </Box>
            ),
            align: 'center',
        },
        {
            header: 'Status',
            render: (row) => (
                <Box sx={{ color: row.is_active ? 'success.main' : 'text.secondary', fontWeight: 500 }}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </Box>
            ),
            align: 'center',
        },
    ];




    const actions = (row) => (
        <Button size="small" variant="outlined" onClick={() => onOpenDialog(row)}>
            Edit
        </Button>
    );




    return (
        <Box>
            <TableView
                title="Location Overrides"
                subtitle="Customize inventory settings per location"
                columns={columns}
                data={items?.results ?? []}
                actions={actions}
                extraHeaderActions={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => onOpenDialog()}
                    >
                        Add Override
                    </Button>
                }
                loading={loading}
                searchable={true}
                showRefresh={true}
                onRefresh={() => window.location.reload()}
            />

            <Dialog open={open} onClose={onCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Override' : 'Add New Override'}
                    <IconButton
                        onClick={onCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <OverrideForm
                        values={formData}
                        locations={locations}
                        catalogItems={catalogItems}
                        onChange={onChangeFormData}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={onCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={onSubmit}>
                        {editing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OverridesViewUI;
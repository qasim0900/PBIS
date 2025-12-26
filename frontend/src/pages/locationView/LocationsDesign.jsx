import TableView from '../../components/template';
import LocationForm from '../../components/forms/LocationForm';
import { Add, LocationOn, Schedule, Code, Close } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';

export default function LocationsDesign({
    locations,
    loading,
    open,
    editing,
    formData,
    setFormData,
    openDialog,
    closeDialog,
    handleSubmit,
}) {
    const columns = [
        {
            header: 'Location',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <LocationOn sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>{row.name}</Box>
                </Box>
            ),
        },
        {
            header: 'Code',
            render: (row) => (
                <Chip icon={<Code fontSize="small" />} label={row.code} size="small" variant="outlined" />
            ),
            align: 'center',
        },
        {
            header: 'Timezone',
            render: (row) => (
                <Chip
                    icon={<Schedule fontSize="small" />}
                    label={row.timezone}
                    size="small"
                    color="info"
                    variant="filled"
                />
            ),
            align: 'center',
        },
    ];

    const actions = (row) => (
        <Button size="small" variant="outlined" onClick={() => openDialog(row)}>
            Edit
        </Button>
    );

    return (
        <>
            <TableView
                title="Locations"
                subtitle={`Manage locations (${locations.length})`}
                columns={columns}
                data={locations}
                actions={actions}
                extraHeaderActions={
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>
                        Add Location
                    </Button>
                }
                loading={loading}
                searchable={true}
                showRefresh={true}
                onRefresh={() => window.location.reload()}
            />

            <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editing ? 'Edit Location' : 'Add Location'}
                    <IconButton onClick={closeDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <LocationForm values={formData} onChange={setFormData} />
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
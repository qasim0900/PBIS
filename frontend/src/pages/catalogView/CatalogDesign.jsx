import TableView from '../../components/template';
import { Add, Inventory, Close } from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
} from '@mui/material';


//-----------------------------------
// :: CATEGORIES Color
//-----------------------------------

/*
This code defines a constant list of categories, where each category includes a value, a display label, and an associated colour, 
typically used for UI elements such as dropdowns or tags.
*/

const CATEGORIES = [
    { value: 'frozen_fruit', label: 'Frozen Fruit' },
    { value: 'supplements', label: 'Supplements' },
    { value: 'liquids', label: 'Liquids' },
    { value: 'fresh_produce', label: 'Fresh Produce' },
    { value: 'dry_stock', label: 'Dry Stock' },
    { value: 'cp_juices', label: 'CP Juices' },
    { value: 'shots', label: 'Shots' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'misc_items', label: 'Misc. Items' },
    { value: 'other', label: 'Other' },
];




const CatalogDesign = ({
    items,
    modalOpen,
    formData,
    setFormData,
    setModalOpen,
    openAddModal,
    openEditModal,
    handleSave,
    saving,
    currentItem,
    locations,
    vendors,
    brands,
    frequencies,
}) => {


    //-----------------------------------
    // :: getCategoryColor Function
    //-----------------------------------

    /*
    This function returns the colour associated with a given category value from the `CATEGORIES` list, and defaults to
     `#64748b` if the category is not found.
    */

    const getCategoryColor = (cat) =>
        CATEGORIES.find((c) => c.value === cat)?.color || '#64748b';


    //-----------------------------------
    // :: Columns List
    //-----------------------------------

    /*
    This code defines the table columns for the inventory list, including a custom-rendered item column with category-based styling
    and a status chip indicating whether each item is active.
    */

    const columns = [
        {
            header: 'Item',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: `${getCategoryColor(row.category)}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Inventory sx={{ color: getCategoryColor(row.category) }} />
                    </Box>
                    <Box>
                        <Box fontWeight={600}>{row.name}</Box>
                        <Box fontSize={13} color="text.secondary">
                            {row.category_display}
                        </Box>
                    </Box>
                </Box>
            ),
        },
        { header: 'Count Unit', accessor: 'count_unit', align: 'center' },
        { header: 'Order Unit', accessor: 'order_unit', align: 'center' },
        { header: 'Par Level', accessor: 'par_level', align: 'center' },
        {
            header: 'Status',
            render: (row) => (
                <Chip
                    label={row.is_active ? 'Active' : 'Inactive'}
                    color={row.is_active ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                />
            ),
            align: 'center',
        },
    ];


    //-----------------------------------
    // :: Return Code
    //-----------------------------------

    /*
    This code renders a searchable inventory table with add/edit actions and a modal dialog 
    containing a form for creating or updating inventory items.
    */

    return (
        <>
            <TableView
                title="Inventory Items"
                subtitle={`Total items: ${items.length}`}
                columns={columns}
                data={items}
                actions={(row) => (
                    <Button size="small" onClick={() => openEditModal(row)}>
                        Edit
                    </Button>
                )}
                extraHeaderActions={
                    <Button variant="contained" startIcon={<Add />} onClick={openAddModal}>
                        Add Item
                    </Button>
                }
                searchable
                showRefresh
            />
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentItem ? 'Edit Item' : 'Add Item'}
                    <IconButton
                        onClick={() => setModalOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={1}>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            sx={{ gridColumn: '1 / -1' }}
                        />

                        <TextField select label="Category" value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                            {CATEGORIES.map((c) => (
                                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                            ))}
                        </TextField>

                        <TextField select label="Location" value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}>
                            {(locations || []).map((l) => (
                                <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField label="Count Unit" value={formData.count_unit}
                            onChange={(e) => setFormData({ ...formData, count_unit: e.target.value })} />

                        <TextField label="Order Unit" value={formData.order_unit}
                            onChange={(e) => setFormData({ ...formData, order_unit: e.target.value })} />

                        <TextField
                            select
                            label="Inventory List"
                            value={formData.frequency || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, frequency: e.target.value })
                            }
                        >
                            <MenuItem value="">— Select Inventory List —</MenuItem>
                            {(frequencies || []).map((f) => (
                                <MenuItem key={f.id} value={f.id}>
                                    {f.frequency_name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Vendor"
                            value={formData.vendor || ''}
                            onChange={(e) => {
                                const vendorId = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    vendor: vendorId,
                                    default_vendor: vendorId,
                                }));
                            }}
                            fullWidth
                        >
                            <MenuItem value="">— Select Vendor —</MenuItem>
                            {(vendors || []).map(v => (
                                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Brand"
                            value={formData.brand || ''}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="">— Select Brand —</MenuItem>
                            {(brands || []).map(b => (
                                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField label="Par Level" type="number" value={formData.par_level}
                            onChange={(e) => setFormData({ ...formData, par_level: e.target.value })} />

                        <TextField label="Order Point" type="number" value={formData.order_point}
                            onChange={(e) => setFormData({ ...formData, order_point: e.target.value })} />

                        <TextField
                            label="Storage Location"
                            value={formData.storage_location}
                            onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                        />
                        <TextField
                            label="Notes"
                            value={formData.notes || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ gridColumn: '1 / -1' }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {currentItem ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


//-----------------------------------
// :: Export CatalogDesign
//-----------------------------------

/*
This line exports the `CatalogDesign` component as the default export from the file, allowing it to be 
imported and used in other parts of the application.
*/

export default CatalogDesign;

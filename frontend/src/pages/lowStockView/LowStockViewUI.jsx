import {
    Warning,
    Error,
    CheckCircle,
} from '@mui/icons-material';
import {
    Box,
    Chip,
    Typography,
} from '@mui/material';
import TableView from '../../components/template';

const getStatusInfo = (highlight) => {
    switch (highlight) {
        case 'low':
        case 'critical':
            return { color: 'error', label: 'Critical', icon: <Error fontSize="small" /> };
        case 'near_par':
            return { color: 'warning', label: 'Low', icon: <Warning fontSize="small" /> };
        default:
            return { color: 'success', label: 'OK', icon: <CheckCircle fontSize="small" /> };
    }
};

const columns = [
    {
        header: 'Item',
        render: (row) => (
            <Typography fontWeight={600}>
                {row.item?.name ?? 'Unknown'}
            </Typography>
        ),
    },
    {
        header: 'Vendor',
        render: (row) => row.vendor?.name ?? row.override?.vendor_name ?? 'N/A',
    },
    {
        header: 'Location',
        render: (row) => (
            <Chip label={row.location || 'N/A'} size="small" />
        ),
    },
    {
        header: 'On Hand',
        align: 'center',
        render: (row) => row.on_hand_quantity ?? 0,
    },
    {
        header: 'Order Qty',
        align: 'center',
        render: (row) => (
            <Typography fontWeight={700} color="error.main">
                {row.calculated_qty_to_order ?? 0}
            </Typography>
        ),
    },
    {
        header: 'Status',
        align: 'center',
        render: (row) => {
            const status = getStatusInfo(row.highlight_state);
            return (
                <Chip
                    icon={status.icon}
                    label={status.label}
                    color={status.color}
                    size="small"
                />
            );
        },
    },
];

const LowStockViewUI = ({
    items,
    loading,
    error,
    criticalCount,
    lowCount,
    headerActions,
}) => {
    const summaryCards = [
        {
            value: criticalCount,
            label: 'Critically Low',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            textColor: 'white',
        },
        {
            value: lowCount,
            label: 'Low Stock',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            textColor: 'white',
        },
        {
            value: items.length,
            label: 'Total Items',
        },
    ];

    return (
        <Box>
            <TableView
                title="Low Stock Alert"
                subtitle="Items that need replenishment"
                columns={columns}
                data={items}
                loading={loading}
                summaryCards={summaryCards}
                extraHeaderActions={headerActions}
                emptyTitle="All items are well stocked!"
                emptyMessage="No items are running low on inventory."
                emptyIcon={<CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />}
            />
        </Box>
    );
};

export default LowStockViewUI;

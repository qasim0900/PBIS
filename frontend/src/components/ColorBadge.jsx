import { Box } from '@mui/material';
import { memo, useMemo } from 'react';

const STATUS_CONFIG = {
  red: { bg: "#fecaca", color: "#991b1b", defaultLabel: "Order Needed" },
  yellow: { bg: "#fffbeb", color: "#92400e", defaultLabel: "OK" },
  green: { bg: "#f0fdf4", color: "#166534", defaultLabel: "Over Par" },
  default: { bg: "#f3f4f6", color: "#4b5563", defaultLabel: "Unknown" },
};

const ColorBadge = ({ status, labels = {} }) => {
  const config = useMemo(() => {
    const { bg, color, defaultLabel } = STATUS_CONFIG[status] || STATUS_CONFIG.default;
    const label = labels[status] || defaultLabel;
    return { bg, color, label };
  }, [status, labels]);

  return (
    <Box
      component="span"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        px: 2,
        py: 0.5,
        borderRadius: 2,
        fontWeight: 600,
        fontSize: 12,
        textAlign: 'center',
        display: 'inline-block',
      }}
    >
      {config.label}
    </Box>
  );
};

export default memo(ColorBadge);

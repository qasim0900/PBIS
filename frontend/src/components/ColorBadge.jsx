import React, { memo } from 'react';
import {
  Box,
} from "@mui/material";
/**
 * ColorBadge Component
 * Displays inventory status clearly for staff
 *
 * @param {string} status 
 * @param {React.ReactNode} children
 */
const STATUS_STYLES = {
  low: 'bg-red-100 text-red-700',
  near: 'bg-yellow-100 text-yellow-800',
  ok: 'bg-green-100 text-green-700',
  default: 'bg-gray-200 text-gray-800',
};

const STATUS_LABELS = {
  low: 'Order Required',
  near: 'Below Par',
  ok: 'In Stock',
  default: '-',
};

const ColorBadge = ({ status, labels = {} }) => {
  const config = {
    red: { bg: "#fecaca", color: "#991b1b", label: labels.red || "Order Needed" },
    yellow: { bg: "#fffbeb", color: "#92400e", label: labels.yellow || "OK" },
    green: { bg: "#f0fdf4", color: "#166534", label: labels.green || "Over Par" },
  }[status] || { bg: "#f3f4f6", color: "#4b5563", label: "Unknown" };

  return (
    <Box sx={{ bgcolor: config.bg, color: config.color, px: 2, py: 0.5, borderRadius: 2, fontWeight: 600, fontSize: 12 }}>
      {config.label}
    </Box>
  );
};
export default memo(ColorBadge);

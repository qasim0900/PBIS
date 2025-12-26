export const calculateOrderQuantity = (parLevel, currentCount) => {
  return Math.max(0, parLevel - currentCount);
};

export const calculateOrderUnits = (quantity, packSize, minOrderQty = 0) => {
  if (packSize <= 0) return 0;
  let units = Math.ceil(quantity / packSize);
  return Math.max(units, minOrderQty);
};

export const getInventoryStatus = (currentCount, orderPoint, parLevel) => {
  if (currentCount <= orderPoint) return 'critical';
  if (currentCount <= parLevel) return 'warning';
  return 'ok';
};

export const getStatusColor = (status) => {
  const colors = {
    critical: '#ef4444',
    warning: '#f59e0b',
    ok: '#22c55e',
  };
  return colors[status] || colors.ok;
};

export const getStatusLabel = (status) => {
  const labels = {
    critical: 'ORDER NOW',
    warning: 'NEAR PAR',
    ok: 'OK',
  };
  return labels[status] || 'OK';
};

export const formatDecimal = (value, places = 2) => {
  return Number(value).toFixed(places);
};

export default {
  calculateOrderQuantity,
  calculateOrderUnits,
  getInventoryStatus,
  getStatusColor,
  getStatusLabel,
  formatDecimal,
};

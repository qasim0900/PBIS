import React, { memo, useMemo } from 'react';

const STATUS_STYLES = {
  low: 'bg-danger text-white',
  near: 'bg-warning text-gray-800',
  ok: 'bg-success text-white',
  default: 'bg-gray-200 text-gray-800',
};

const ColorBadge = ({ status = 'default', children }) => {
  const className = useMemo(() => {
    return `px-3 py-1 rounded-full text-sm font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.default}`;
  }, [status]);

  return <span className={className}>{children}</span>;
};

// Prevent unnecessary re-renders
export default memo(ColorBadge);

const ColorBadge = ({ status, children }) => {
  const colors = {
    low: 'bg-danger text-white',
    near: 'bg-warning text-gray-800',
    ok: 'bg-success text-white',
    default: 'bg-gray-200 text-gray-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] || colors.default}`}>
      {children}
    </span>
  );
};

export default ColorBadge;

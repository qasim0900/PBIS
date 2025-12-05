import { useState, useMemo } from 'react';
import ColorBadge from './ColorBadge';

const CountRow = ({ entry, onUpdate }) => {
  const { id, on_hand_quantity, override, catalog_item } = entry;
  const [value, setValue] = useState(on_hand_quantity || '');
  const [saving, setSaving] = useState(false);

  const numericValue = useMemo(() => parseInt(value) || 0, [value]);

  // Update input value locally
  const handleChange = (e) => setValue(e.target.value);

  // Trigger update on blur if value changed
  const handleBlur = async () => {
    if (numericValue !== (on_hand_quantity || 0)) {
      setSaving(true);
      await onUpdate(id, { on_hand_quantity: numericValue });
      setSaving(false);
    }
  };

  // Determine stock status
  const stockStatus = useMemo(() => {
    if (!override) return 'default';
    if (numericValue <= override.order_point) return 'low';
    if (numericValue <= override.par_level * 0.7) return 'near';
    return 'ok';
  }, [numericValue, override]);

  // Calculate quantity to order
  const qtyToOrder = useMemo(() => {
    if (!override) return 0;
    const deficit = override.par_level - numericValue;
    if (deficit <= 0) return 0;
    const packSize = catalog_item?.pack_size || 1;
    return Math.ceil(deficit / packSize);
  }, [numericValue, override, catalog_item]);

  // Map stock status to row class
  const rowClass = {
    low: 'stock-low',
    near: 'stock-near',
    ok: 'stock-ok',
    default: '',
  }[stockStatus];

  return (
    <tr className={`border-b border-gray-100 ${rowClass}`}>
      <td className="py-4 px-4">
        <div>
          <p className="font-semibold text-lg">{catalog_item?.name}</p>
          <p className="text-sm text-gray-500">{catalog_item?.category}</p>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm text-gray-500">
          1 {catalog_item?.order_unit} = {catalog_item?.pack_size} {catalog_item?.count_unit}
        </p>
      </td>
      <td className="py-4 px-4">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={saving}
          className="w-24 px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          min="0"
        />
      </td>
      <td className="py-4 px-4 text-center">
        <span className="text-lg font-semibold">{override?.par_level || '-'}</span>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`text-xl font-bold ${qtyToOrder > 0 ? 'text-danger' : 'text-success'}`}>
          {qtyToOrder}
        </span>
        <span className="text-sm text-gray-500 ml-1">{catalog_item?.order_unit}</span>
      </td>
      <td className="py-4 px-4 text-center">
        <ColorBadge status={stockStatus}>
          {stockStatus === 'low' ? 'Low' : stockStatus === 'near' ? 'Near Par' : 'OK'}
        </ColorBadge>
      </td>
    </tr>
  );
};

export default CountRow;

import { useState } from 'react';
import ColorBadge from './ColorBadge';

const CountRow = ({ entry, onUpdate }) => {
  const [value, setValue] = useState(entry.on_hand_quantity || '');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = async () => {
    if (value !== entry.on_hand_quantity) {
      setSaving(true);
      await onUpdate(entry.id, { on_hand_quantity: parseInt(value) || 0 });
      setSaving(false);
    }
  };

  const getStockStatus = () => {
    if (!entry.override) return 'default';
    const onHand = parseInt(value) || 0;
    if (onHand <= entry.override.order_point) return 'low';
    if (onHand <= entry.override.par_level * 0.7) return 'near';
    return 'ok';
  };

  const calculateQtyToOrder = () => {
    if (!entry.override) return 0;
    const onHand = parseInt(value) || 0;
    const deficit = entry.override.par_level - onHand;
    if (deficit <= 0) return 0;
    const packSize = entry.catalog_item?.pack_size || 1;
    return Math.ceil(deficit / packSize);
  };

  const stockStatus = getStockStatus();
  const qtyToOrder = calculateQtyToOrder();

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
          <p className="font-semibold text-lg">{entry.catalog_item?.name}</p>
          <p className="text-sm text-gray-500">{entry.catalog_item?.category}</p>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm text-gray-500">
          1 {entry.catalog_item?.order_unit} = {entry.catalog_item?.pack_size} {entry.catalog_item?.count_unit}
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
        <span className="text-lg font-semibold">{entry.override?.par_level || '-'}</span>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`text-xl font-bold ${qtyToOrder > 0 ? 'text-danger' : 'text-success'}`}>
          {qtyToOrder}
        </span>
        <span className="text-sm text-gray-500 ml-1">{entry.catalog_item?.order_unit}</span>
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

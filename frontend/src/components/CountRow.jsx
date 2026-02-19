import ColorBadge from './ColorBadge';
import { useState, useMemo, useCallback } from 'react';

//-----------------------------------
// :: Status Classes List
//-----------------------------------

/*
This defines a **mapping of stock status keys** (`low`, `near`, `ok`, `default`) 
to corresponding CSS class names for styling inventory levels.
*/

const STATUS_CLASSES = {
  low: 'stock-low',
  near: 'stock-near',
  ok: 'stock-ok',
  default: '',
};

//-----------------------------------
// :: Count Row Function
//-----------------------------------

/*
`CountRow` is a table row showing an inventory item with editable quantity, stock status, 
and order info, updating the parent on changes.
*/

const CountRow = ({ entry, onUpdate }) => {
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(on_hand_quantity);
  const { id, on_hand_quantity = 0, override, catalog_item } = entry;


  //-----------------------------------
  // :: Numeric Value Function
  //-----------------------------------

  /*
  `This memoizes the numeric version of value, 
  parsing it as an integer and defaulting to 0 if invalid, recalculating only when value changes.
  */

  const numericValue = useMemo(() => parseInt(value, 10) || 0, [value]);


  //-----------------------------------
  // :: Handle Change Function
  //-----------------------------------

  /*
  This **memoized handler updates `value` state** whenever the input changes.
  */

  const handleChange = useCallback((e) => setValue(e.target.value), []);

  //-----------------------------------
  // :: Handle Blur Function
  //-----------------------------------

  /*
  This **memoized blur handler saves the updated quantity** by calling `onUpdate` only if it changed, 
  showing a saving state while the update is in progress.
  */

  const handleBlur = useCallback(async () => {
    if (numericValue !== on_hand_quantity) {
      setSaving(true);
      await onUpdate(id, { on_hand_quantity: numericValue });
      setSaving(false);
    }
  }, [numericValue, onUpdate, id, on_hand_quantity]);


  //-----------------------------------
  // :: Stock Status Function
  //-----------------------------------

  /*
  This **computes the stock status** (`low`, `near`, `ok`, or `default`) 
  based on the current quantity and override thresholds, memoized to recalc only when `numericValue` or `override` changes.
  */

  const stockStatus = useMemo(() => {
    if (!override) return 'default';
    if (numericValue <= override.order_point) return 'low';
    if (numericValue <= override.par_level * 0.7) return 'near';
    return 'ok';
  }, [numericValue, override]);


  //-----------------------------------
  // :: qty To Order Function
  //-----------------------------------

  /*
  This **calculates the quantity to order**, based on the deficit from `par_level` and item `pack_size`,
  memoized to update only when `numericValue`, `override`, or `catalog_item` changes.
  */

  const qtyToOrder = useMemo(() => {
    if (!override) return 0;
    const deficit = override.par_level - numericValue;
    if (deficit <= 0) return 0;
    const packSize = catalog_item?.pack_size || 1;
    return Math.ceil(deficit / packSize);
  }, [numericValue, override, catalog_item]);

  //-----------------------------------
  // :: Row Class Function
  //-----------------------------------

  /*
  This sets the table row's **CSS class** based on the current `stockStatus` using the `STATUS_CLASSES` mapping.
  */

  const rowClass = STATUS_CLASSES[stockStatus];


  //-----------------------------------
  // :: Return Code
  //-----------------------------------

  /*
  Renders a table row displaying a catalog item’s name, category, units, 
  editable on-hand quantity, par level, quantity to order, and a colour-coded stock status badge.
  */

  return (
    <tr className={`border-b border-gray-100 ${rowClass}`}>
      <td className="py-4 px-4">
        <p className="font-semibold text-lg">{catalog_item?.name}</p>
        <p className="text-sm text-gray-500">{catalog_item?.category}</p>
      </td>

      <td className="py-4 px-4 text-sm text-gray-500">
        1 {catalog_item?.order_unit} = {catalog_item?.pack_size} {catalog_item?.count_unit}
      </td>

      <td className="py-4 px-4">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={saving}
          min={0}
          className="w-24 px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
        />
      </td>

      <td className="py-4 px-4 text-center font-semibold text-lg">{override?.par_level ?? '-'}</td>

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


//-----------------------------------
// :: export CountRow
//-----------------------------------

/*
Exports the `CountRow` component as the default export for use in other parts of the application.
*/

export default CountRow;

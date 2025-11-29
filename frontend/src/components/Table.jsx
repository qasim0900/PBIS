import { useState } from 'react';

const Table = ({ columns, data, searchable = true, actions }) => {
  const [search, setSearch] = useState('');

  const filteredData = searchable && search
    ? data.filter((row) =>
        columns.some((col) => {
          const value = col.accessor ? row[col.accessor] : '';
          return String(value).toLowerCase().includes(search.toLowerCase());
        })
      )
    : data;

  return (
    <div className="card">
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {columns.map((col) => (
                <th key={col.accessor || col.header} className="text-left py-3 px-4 font-semibold text-gray-700">
                  {col.header}
                </th>
              ))}
              {actions && <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr key={row.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.accessor || col.header} className="py-3 px-4">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

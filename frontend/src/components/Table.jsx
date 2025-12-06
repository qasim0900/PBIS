import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table as TableMUI,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  TextField,
} from '@mui/material';

// Utility to access nested object values safely
const getNestedValue = (obj, accessor) =>
  accessor?.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj) ?? '';

const Table = ({ columns, data = [], searchable = true, actions }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search input
  const filteredData = useMemo(() => {
    if (!searchable || !search) return data;

    const lowerSearch = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (col.render) return false; // skip custom render columns
        const value = getNestedValue(row, col.accessor);
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [search, data, columns, searchable]);

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Common styles for sticky header cells
  const headerCellStyle = {
    background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
    color: 'white',
    fontWeight: 600,
    minWidth: 100,
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 1 }}>
      {searchable && (
        <TextField
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        />
      )}

      <TableContainer sx={{ maxHeight: 440 }}>
        <TableMUI stickyHeader aria-label="custom table">
          <TableHead>
            <TableRow>
              {columns.map(({ header, accessor, align = 'left', minWidth }, colIdx) => (
                <TableCell
                  key={accessor || colIdx}
                  align={align}
                  sx={{ ...headerCellStyle, minWidth: minWidth || headerCellStyle.minWidth }}
                >
                  {header}
                </TableCell>
              ))}
              {actions && <TableCell sx={headerCellStyle}>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => (
                  <TableRow
                    hover
                    key={row.id ?? `row-${page * rowsPerPage + idx}`} // unique key
                    sx={{ backgroundColor: 'white' }}
                  >
                    {columns.map(({ accessor, render }, colIdx) => (
                      <TableCell key={accessor || colIdx}>
                        {render ? render(row) : getNestedValue(row, accessor)}
                      </TableCell>
                    ))}
                    {actions && <TableCell>{actions(row)}</TableCell>}
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableMUI>
      </TableContainer>

      {filteredData.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </Paper>
  );
};

export default Table;

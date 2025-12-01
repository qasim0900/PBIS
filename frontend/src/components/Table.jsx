import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TableMUI from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

const getNestedValue = (obj, accessor) => {
  if (!accessor) return '';
  return accessor.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const Table = ({ columns, data, searchable = true, actions }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredData = searchable && search
    ? data.filter((row) =>
      columns.some((col) => {
        if (col.render) return false;
        const value = getNestedValue(row, col.accessor);
        return String(value).toLowerCase().includes(search.toLowerCase());
      })
    )
    : data;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 1 }}>
      {searchable && (
        <TextField
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        />
      )}

      <TableContainer sx={{ maxHeight: 440 }}>
        <TableMUI stickyHeader aria-label="custom table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.accessor || column.header}
                  align={column.align || 'left'}
                  sx={{
                    background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
                    color: 'white',
                    fontWeight: 600,
                    minWidth: column.minWidth || 100,
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  sx={{
                    background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {(filteredData.length > 0
              ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : []
            ).map((row, index) => (
              <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={row.id || index}
                sx={{ backgroundColor: 'white' }}
              >
                {columns.map((col) => (
                  <TableCell key={col.accessor || col.header}>
                    {col.render ? col.render(row) : getNestedValue(row, col.accessor)}
                  </TableCell>
                ))}
                {actions && <TableCell>{actions(row)}</TableCell>}
              </TableRow>
            ))}

            {filteredData.length === 0 && (
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

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
  Card,
  CardContent,
  Stack,
  Typography,
  Skeleton,
  Alert,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Refresh, CheckCircle } from '@mui/icons-material';


//---------------------------------------
// :: Get Nested Value Function
//---------------------------------------

/*
A utility function that safely retrieves a nested value from an object using a dot-separated accessor string,
 returning an empty string if the path is missing.
*/

const getNestedValue = (obj, accessor) =>
  accessor?.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj) ?? '';


//---------------------------------------
// :: Reusable Table  Function
//---------------------------------------

/*
A fully responsive reusable table component that supports searchable data, pagination, custom column rendering, row actions, 
and switches between card and table layouts based on screen size.
*/

const ReusableTable = ({ columns, data = [], searchable = true, actions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  //---------------------------------------
  // :: Filtered Date  Function
  //---------------------------------------

  /*
  A memoized filter that searches table data across non-rendered column values based on the user’s search input.
  */

  const filteredData = useMemo(() => {
    if (!searchable || !search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter((row) =>
      columns.some(({ accessor, render }) => {
        if (render) return false;
        return String(getNestedValue(row, accessor)).toLowerCase().includes(lowerSearch);
      })
    );
  }, [search, data, columns, searchable]);


  //---------------------------------------
  // :: Handle Change Page Function
  //---------------------------------------

  /*
  Handlers that update the current page and reset pagination when the number of rows per page changes.
  */

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };


  //---------------------------------------
  // :: Handle Cell Style Function
  //---------------------------------------

  /*
  Defines a responsive header cell style with a gradient background, white text, bold font weight, 
  and adaptive font size and padding.
  */

  const headerCellStyle = {
    background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
    padding: { xs: 1, sm: 1.5, md: 2 },
  };


  //---------------------------------------
  // :: Cell Style Variable
  //---------------------------------------

  /*
  Defines responsive table cell styling with adaptive font sizes and padding across screen sizes.
  */

  const cellStyle = { fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' }, padding: { xs: 1, sm: 1.5, md: 2 } };


  //---------------------------------------
  // :: Is Mobile Code Design
  //---------------------------------------

  /*
  Renders a mobile-friendly card-based layout for table data with pagination, displaying each row as a 
  stacked card with optional actions.
  */

  if (isMobile) {
    return (
      <Box sx={{ width: '100%', overflow: 'hidden', p: 1 }}>
        <Stack spacing={2}>
          {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
            <Card key={row.id || idx} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Stack spacing={2}>
                  {columns.map(({ header, accessor, render }, colIdx) => (
                    <Box key={accessor || colIdx}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        {header}
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                        {render ? render(row) : getNestedValue(row, accessor)}
                      </Typography>
                    </Box>
                  ))}
                  {actions && <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>{actions(row)}</Box>}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }


  //---------------------------------------
  // :: Desktop table view
  //---------------------------------------

  /*
  Renders a desktop table view with sticky headers, paginated and searchable rows, optional action columns, 
  and responsive styling with a fallback “No data found” state.
  */

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: { xs: 0.5, sm: 1 } }}>
      <TableContainer sx={{ maxHeight: 540, overflowX: 'auto' }}>
        <TableMUI stickyHeader aria-label="dynamic table" size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map(({ header, accessor, align = 'left', minWidth }, idx) => (
                <TableCell key={accessor || idx} align={align} sx={{ ...headerCellStyle, minWidth: minWidth || (isMobile ? 100 : 120), whiteSpace: 'nowrap' }}>
                  {header}
                </TableCell>
              ))}
              {actions && <TableCell sx={headerCellStyle}>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                <TableRow hover key={row.id || `${page}-${idx}`}>
                  {columns.map(({ accessor, render, align }, colIdx) => (
                    <TableCell key={accessor || colIdx} align={align} sx={cellStyle}>
                      {render ? render(row) : getNestedValue(row, accessor)}
                    </TableCell>
                  ))}
                  {actions && <TableCell sx={cellStyle}>{actions(row)}</TableCell>}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 4 }}>
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableMUI>
      </TableContainer>

      {filteredData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 1 }}
        />
      )}
    </Paper>
  );
};


//---------------------------------------
// :: Page Header Function
//---------------------------------------

/*
A responsive page header component that renders a title, subtitle, breadcrumb navigation links, 
optional actions, and an optional refresh control.
*/

const PageHeader = ({ title, subtitle, breadcrumbs = [], children, onRefresh, showRefresh = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const breadcrumbLinks = breadcrumbs.map((crumb, index) => {
    const isLast = index === breadcrumbs.length - 1;
    return (
      <Link key={index} underline="hover" color={isLast ? 'text.primary' : 'inherit'} href={crumb.href} sx={{ fontSize: { xs: 12, sm: 14 }, fontWeight: isLast ? 500 : 400 }}>
        {crumb.label}
      </Link>
    );
  });


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Renders a responsive page header with breadcrumbs, title, optional subtitle, refresh action, and optional 
  child content arranged for mobile and desktop layouts.
  */

  return (
    <Box sx={{ mb: 1 }}>
      <AppBar position="static" elevation={0} color="transparent" sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, py: 2, gap: 2 }}>
          {breadcrumbs.length > 0 && <Breadcrumbs sx={{ mb: { xs: 1, sm: 0 } }}>{breadcrumbLinks}</Breadcrumbs>}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, color: 'text.primary' }}>
                {title}
              </Typography>
              {showRefresh && (
                <IconButton onClick={onRefresh} size="small">
                  <Refresh fontSize="small" />
                </IconButton>
              )}
            </Box>
            {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
          </Box>
          {children && <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>{children}</Box>}
        </Toolbar>
      </AppBar>
    </Box>
  );
};


//---------------------------------------
// :: Main TableView
//---------------------------------------

/*
A flexible table view component that combines a page header, optional breadcrumbs, searchable and paginated table or card layouts, 
loading/error states, summary cards, and customizable actions.
*/


const TableView = ({
  title,
  subtitle = '',
  breadcrumbs = [],
  columns = [],
  data = [],
  actions = null,
  extraHeaderActions = null,
  loading = false,
  error = null,
  searchable = true,
  showRefresh = false,
  onRefresh = () => { },
  summaryCards = null,
  emptyMessage = 'No data available',
  emptyTitle = 'All clear!',
  emptyIcon = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  `TableView` is a responsive, feature-rich component that displays a page header, optional summary cards, a searchable and 
  paginated table, and handles loading, empty, and error states.
  */

  return (
    <Box sx={{ pt: 1, px: { xs: 1, sm: 2, md: 3 }, pb: 2 }}>
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} showRefresh={showRefresh} onRefresh={onRefresh}>
        {extraHeaderActions}
      </PageHeader>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {summaryCards && !loading && summaryCards.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ '& > *': { width: { xs: '100%', sm: `${100 / summaryCards.length}%` } } }}>
            {summaryCards.map((card, idx) => (
              <Card key={idx} sx={{ background: card.gradient || 'background.paper', color: card.textColor || 'text.primary' }}>
                <CardContent sx={{ py: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                  <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={700}>{card.value}</Typography>
                  {card.label && <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>{card.label}</Typography>}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {loading ? (
        <Card>
          <CardContent>
            <Stack spacing={2}>{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />)}</Stack>
          </CardContent>
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
            {emptyIcon || <CheckCircle sx={{ fontSize: { xs: 60, sm: 80 }, color: 'success.main', mb: 2 }} />}
            <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>{emptyTitle}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{emptyMessage}</Typography>
          </CardContent>
        </Card>
      ) : (
        <ReusableTable columns={columns} data={data} searchable={searchable} actions={actions} />
      )}
    </Box>
  );
};


//---------------------------------------
// :: Export Table View
//---------------------------------------

/*
Exports the `TableView` component as the default export for use in other parts of the application.
*/

export default TableView;

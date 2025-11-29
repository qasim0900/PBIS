import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

const Header = ({
  title,
  subtitle,
  breadcrumbs = [],
  children,
  onRefresh,
  showRefresh = false,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Top Navbar */}
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Toolbar sx={{ flexWrap: 'wrap', py: 2 }}>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Box sx={{ width: '100%', mb: 1 }}>
              <Breadcrumbs>
                {breadcrumbs.map((crumb, index) => (
                  <Link
                    key={index}
                    underline="hover"
                    color={
                      index === breadcrumbs.length - 1
                        ? 'text.primary'
                        : 'inherit'
                    }
                    href={crumb.href}
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight:
                        index === breadcrumbs.length - 1 ? 500 : 400,
                    }}
                  >
                    {crumb.label}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>
          )}

          {/* Title + Refresh */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary',
              }}
            >
              {title}

              {showRefresh && (
                <IconButton
                  onClick={onRefresh}
                  size="small"
                  sx={{
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              )}
            </Typography>

            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Right Side Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {children}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;

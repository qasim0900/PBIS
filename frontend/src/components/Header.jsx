import React from 'react';
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

/**
 * Header Component
 *
 * @param {string} title - Main header title
 * @param {string} subtitle - Optional subtitle
 * @param {Array<{label: string, href: string}>} breadcrumbs - Breadcrumb items
 * @param {React.ReactNode} children - Right side buttons or actions
 * @param {() => void} onRefresh - Refresh callback
 * @param {boolean} showRefresh - Toggle refresh button
 */
const Header = ({
  title,
  subtitle,
  breadcrumbs = [],
  children = null,
  onRefresh,
  showRefresh = false,
}) => {
  const breadcrumbLinks = breadcrumbs.map((crumb, index) => {
    const isLast = index === breadcrumbs.length - 1;
    return (
      <Link
        key={index}
        underline="hover"
        color={isLast ? 'text.primary' : 'inherit'}
        href={crumb.href}
        sx={{ fontSize: 14, fontWeight: isLast ? 500 : 400 }}
      >
        {crumb.label}
      </Link>
    );
  });

  return (
    <Box sx={{ mb: 4 }}>
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
        <Toolbar sx={{ flexWrap: 'wrap', py: 2, gap: 2 }}>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && <Breadcrumbs>{breadcrumbLinks}</Breadcrumbs>}

          {/* Title & optional refresh */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {title}
              </Typography>

              {showRefresh && (
                <IconButton
                  onClick={onRefresh}
                  size="small"
                  aria-label="Refresh"
                  sx={{
                    ml: 1,
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' },
                  }}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              )}
            </Box>

            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Right side actions */}
          {children && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>{children}</Box>}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default React.memo(Header);

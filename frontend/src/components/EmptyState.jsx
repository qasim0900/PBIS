import React, { memo } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { Box, Card, CardContent, Typography } from '@mui/material';

//---------------------------------------
// :: empty state with an optional icon
//---------------------------------------

/*
Renders a user-friendly empty state with an optional icon, title, message, and action element.
*/

/**
 * EmptyState Component
 * Displays a friendly empty state message with optional action
 *
 * @param {React.ElementType} icon - Optional icon component
 * @param {string} title - Main title of the empty state
 * @param {string} message - Optional descriptive message
 * @param {React.ReactNode} action - Optional action element (button, link, etc.)
 */


//---------------------------------------
// :: Empty State Function
//---------------------------------------

/*
Renders a centred card displaying an optional icon, title, message, and action element, with responsive styling.
*/

const EmptyState = ({ icon: Icon = CheckCircle, title, message, action }) => {


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Renders a centered card with an optional icon, title, message, and action, all styled responsively for different screen sizes.
  */

  return (
    <Card sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
      <CardContent>
        <Icon sx={{ fontSize: { xs: 60, sm: 80 }, color: 'success.main', mb: 2 }} />

        <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
          {title}
        </Typography>

        {message && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}

        {action && <Box sx={{ mt: 3 }}>{action}</Box>}
      </CardContent>
    </Card>
  );
};

//---------------------------------------
// :: Export Memo Empty State
//---------------------------------------

/*
Exports the `EmptyState` component wrapped in `memo` to prevent unnecessary re-renders when props don’t change.
*/

export default memo(EmptyState);

import React, { memo } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { Box, Card, CardContent, Typography } from '@mui/material';

const EmptyState = ({ icon: Icon = CheckCircle, title, message, action }) => {
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

export default memo(EmptyState);

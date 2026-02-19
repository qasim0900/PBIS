import { Box } from '@mui/material';
import { memo, useMemo } from 'react';


//-----------------------------------
// :: AJSDoc comment describes
//-----------------------------------

/*
This JSDoc comment describes the ColorBadge component, which shows inventory 
status visually, taking a status key (red, yellow, green) and optional labels for custom text.
*/

/**
 * ColorBadge Component
 * Displays inventory status clearly for staff
 *
 * @param {string} status - Status key (red, yellow, green)
 * @param {Object} labels - Optional custom labels for statuses
 */

//-----------------------------------
// :: Status Config Function
//-----------------------------------

/*
This defines a **configuration object mapping inventory statuses** 
(`red`, `yellow`, `green`, `default`) to their background color, text color, and default label for the `ColorBadge` component.
*/

const STATUS_CONFIG = {
  red: { bg: "#fecaca", color: "#991b1b", defaultLabel: "Order Needed" },
  yellow: { bg: "#fffbeb", color: "#92400e", defaultLabel: "OK" },
  green: { bg: "#f0fdf4", color: "#166534", defaultLabel: "Over Par" },
  default: { bg: "#f3f4f6", color: "#4b5563", defaultLabel: "Unknown" },
};

//-----------------------------------
// :: Color Badge Function
//-----------------------------------

/*
`ColorBadge` is a component that **displays a coloured badge for an inventory status**, 
using `STATUS_CONFIG` for colors and labels, with optional custom labels via the `labels` prop.
*/

const ColorBadge = ({ status, labels = {} }) => {

  //-----------------------------------
  // :: useMemo Function
  //-----------------------------------

  /*
  This line **memoizes the badge configuration**, selecting the background color, text color, 
  and label based on `status` and optional custom `labels`, recalculating only when `status` or `labels` change.
  */


  const config = useMemo(() => {
    const { bg, color, defaultLabel } = STATUS_CONFIG[status] || STATUS_CONFIG.default;
    const label = labels[status] || defaultLabel;
    return { bg, color, label };
  }, [status, labels]);


  //-----------------------------------
  // :: Return Code
  //-----------------------------------

  /*
  This JSX **renders a small, styled badge** showing the status label with background and text colors from `config`.
  */

  return (
    <Box
      component="span"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        px: 2,
        py: 0.5,
        borderRadius: 2,
        fontWeight: 600,
        fontSize: 12,
        textAlign: 'center',
        display: 'inline-block',
      }}
    >
      {config.label}
    </Box>
  );
};

//-----------------------------------
// :: Export Memo Color Badge
//-----------------------------------

/*
This line **exports `ColorBadge` wrapped with `React.memo`**, making it a 
memoized component that only re-renders when its props (`status` or `labels`) change.
*/

export default memo(ColorBadge);

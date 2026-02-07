import { Box, Skeleton, Container, Stack } from '@mui/material';

//-----------------------------------
// :: App Loading Function
//-----------------------------------

/*
`AppLoading` is a full-screen skeleton loader component showing a circular loader, 
title, form fields, and footer placeholders with a gradient background while content is loading.
*/

export default function AppLoading() {

  //-----------------------------------
  // :: skeleton Bg Function
  //-----------------------------------

  /*
  This defines a **semi-transparent white colour** used as the background for the skeleton loader elements.
  */

  const skeletonBg = 'rgba(255,255,255,0.3)';


  //-----------------------------------
  // :: Return Code
  //-----------------------------------

  /*
  This JSX renders a **full-screen loading skeleton** with a gradient background, including a circular loader, title placeholder,
   form field placeholders, and footer skeletons, all centred on the screen.
  */

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3} alignItems="center">

          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Skeleton
              variant="circular"
              width={60}
              height={60}
              sx={{ bgcolor: skeletonBg }}
            />
          </Box>


          <Skeleton
            variant="text"
            width={200}
            height={50}
            sx={{ bgcolor: skeletonBg }}
          />


          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} variant="rounded" width="100%" height={56} />
          ))}

          <Box sx={{ mt: 4, width: '100%' }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

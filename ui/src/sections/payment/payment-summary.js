import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
// import Switch from '@mui/material/Switch'; // commented out
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function PaymentSummary({ plan, sx, ...other }) {
  if (!plan) return null;

  const { name, billingCycle, priceINR, discountedPriceINR, taxPercentageINR } = plan;

  // Calculate tax and total
  const taxAmount = (discountedPriceINR * taxPercentageINR) / 100;
  const totalBilled = discountedPriceINR + taxAmount;

  const renderPrice = (
    <Stack direction="row" justifyContent="flex-end" spacing={1} alignItems="baseline">
      <Typography variant="h5" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
        ₹{priceINR}
      </Typography>
      <Typography variant="h3" color="primary">
        ₹{discountedPriceINR}
      </Typography>
    </Stack>
  );

  return (
    <Box
      sx={{
        p: 5,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" sx={{ mb: 5 }}>
        Summary
      </Typography>

      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Subscription
          </Typography>
          <Label color="error">{name}</Label>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Billing Cycle
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {billingCycle}
          </Typography>
        </Stack>

        {renderPrice}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Tax ({taxPercentageINR}%)
          </Typography>
          <Typography variant="body2">₹{taxAmount.toFixed(2)}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">Total Billed</Typography>
          <Typography variant="subtitle1">₹{totalBilled.toFixed(2)}</Typography>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
      </Stack>

      <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
        * Plus applicable taxes
      </Typography>

      <Button type="submit" fullWidth size="large" variant="contained" sx={{ mt: 5, mb: 3 }}>
        Upgrade My Plan
      </Button>

      <Stack alignItems="center" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:shield-check-bold" sx={{ color: 'success.main' }} />
          <Typography variant="subtitle2">Secure credit card payment</Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
          This is a secure 128-bit SSL encrypted payment
        </Typography>
      </Stack>
    </Box>
  );
}

PaymentSummary.propTypes = {
  plan: PropTypes.object,
  sx: PropTypes.object,
};

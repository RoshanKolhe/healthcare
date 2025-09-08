import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// components

// ----------------------------------------------------------------------

export default function OrderDetailsInfo({ patient, dispatch, payment, shippingAddress }) {
  const renderCustomer = (
    <>
      <CardHeader
        title="Patient Info"
      />
      <Stack direction="row" sx={{ p: 3 }} justifyContent="space-between"> 
        <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2">{patient?.patientName || ''}</Typography>

          <Box sx={{ color: 'text.secondary' }}>{patient?.email}</Box>
        </Stack>
        <Stack spacing={0.5} alignItems="end" sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2">{patient?.age || ''}</Typography>

          <Box sx={{ color: 'text.secondary' }}>{patient?.gender}</Box>
        </Stack>
      </Stack>
    </>
  );

  const renderPayment = (
    <>
      <CardHeader
        title="Payment"
      />
      <Stack direction="row" alignItems="center" sx={{ px: 3, py: 1, typography: 'body2' }}>
        <Box component="span" sx={{ color: 'text.secondary', flexGrow: 1 }}>
          Amount
        </Box>

        {payment?.totalAmount || 'NA'}
      </Stack>
    </>
  );

  return (
    <Card>
      {renderCustomer}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderPayment}
    </Card>
  );
}

OrderDetailsInfo.propTypes = {
  patient: PropTypes.object,
  dispatch: PropTypes.object,
  payment: PropTypes.object,
  shippingAddress: PropTypes.object,
};

// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function PaymentBillingAddress() {
  return (
    <div>
      <Typography variant="h6">Billing Address</Typography>

      <Stack spacing={3} mt={5}>
        <RHFTextField fullWidth name="personName" label="Person name" />
        <RHFTextField fullWidth name="phoneNumber" label="Phone number" />
        <RHFTextField fullWidth name="email" label="Email" />
        <RHFTextField fullWidth name="address" label="Address" />
      </Stack>
    </div>
  );
}

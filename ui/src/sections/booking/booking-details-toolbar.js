import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { Select } from '@mui/material';

// ----------------------------------------------------------------------

export default function BookingDetailsToolbar({
  booking,
  status,
  backLink,
  createdAt,
  bookingNumber,
  statusOptions,
  onChangeStatus,
  refreshBooking,
}) {

  const getStatusLabel = (currentStatus) => {
    const foundStatus = statusOptions.find((res) => Number(res.value) === Number(currentStatus));
    return foundStatus ? foundStatus.label : 'Unknown Status';
  };

  return (
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} href={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4"> Booking {bookingNumber} </Typography>
              <Label
                variant="soft"
                color={
                  (status === 0 && 'warning') ||
                  (status === 1 && 'success') ||
                  (status === 2 && 'error') ||
                  'default'
                }
              >
                {status === 0 && 'Confirmed'}
                {status === 1 && 'Completed'}
                {status === 2 && 'Cancelled'}
              </Label>
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {fDateTime(createdAt)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Select
            value={Number(status)}
            onChange={(e) => onChangeStatus(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 160, textTransform: 'capitalize' }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

  );
}

BookingDetailsToolbar.propTypes = {
  booking: PropTypes.object,
  backLink: PropTypes.string,
  createdAt: PropTypes.string,
  onChangeStatus: PropTypes.func,
  bookingNumber: PropTypes.number,
  status: PropTypes.number,
  statusOptions: PropTypes.array,
  refreshBooking: PropTypes.func,
};

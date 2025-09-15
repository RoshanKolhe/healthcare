'use client';

import { useState, useCallback, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
//
import { BOOKING_STATUS_OPTIONS } from 'src/utils/constants';
import { useGetBooking } from 'src/api/booking';
import BookingDetailsInfo from '../booking-details-info';
import BookingDetailsToolbar from '../booking-details-toolbar';
import BookingDetailsHistory from '../booking-details-history';
import BookingPatientFullDetailsInfo from '../booking-patientfulldetails-info';

// ----------------------------------------------------------------------

export default function BookingDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;
  const { booking, refreshBooking } = useGetBooking(id);
  console.log('booking data', booking);
  const [currentBooking, setCurrentBooking] = useState();
  const [status, setStatus] = useState();

  const handleChangeStatus = useCallback((newValue) => {
    setStatus(newValue);
  }, []);

  useEffect(() => {
    if (booking) {
      setCurrentBooking(booking);
      setStatus(booking.status);
    }
  }, [booking]);
  console.log('currentBooking', currentBooking);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <BookingDetailsToolbar
        booking={currentBooking}
        backLink={paths.dashboard.booking.list}
        bookingNumber={currentBooking?.id}
        createdAt={currentBooking?.createdAt}
        status={status}
        onChangeStatus={handleChangeStatus}
        statusOptions={BOOKING_STATUS_OPTIONS}
        refreshBooking={refreshBooking}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <BookingDetailsHistory history={currentBooking?.patientBookingHistories} booking={currentBooking} />
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <BookingDetailsInfo
            patient={currentBooking?.patientFullDetail}
            dispatch={currentBooking?.dispatch}
            payment={currentBooking?.payment}
            shippingAddress={currentBooking?.shippingAddress}
          />
        </Grid>
        <Grid xs={12} md={12}>
          <BookingPatientFullDetailsInfo
            patientDetail={currentBooking?.patientFullDetail}
            patient={currentBooking?.personalInformation}
            dispatch={currentBooking?.dispatch}
            payment={currentBooking?.payment}
            shippingAddress={currentBooking?.shippingAddress}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

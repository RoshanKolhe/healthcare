/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
// @mui
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Label from 'src/components/label';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// utils
import { fDate, fTime } from 'src/utils/format-time';
import { BOOKING_HISTORY_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------
const statusColors = {
  0: 'success', // Pending always green
  1: 'grey', // Reschedule grey
  2: 'success', // Completed green
  3: 'error', // Cancelled red
};

export default function BookingDetailsHistory({ history = [], booking }) {
  console.log('history', history);

  // const sortedHistory = [...history].sort(
  //   (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  // );
  // const hasCancelled = sortedHistory.some((h) => h.status === 3);
  const renderSummary = (
    <Stack
      spacing={2}
      component={Paper}
      variant="outlined"
      sx={{
        p: 2.5,
        minWidth: 260,
        flexShrink: 0,
        bbookingRadius: 2,
        typography: 'body2',
        bbookingStyle: 'dashed',
      }}
    >
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Booking time</Box>
        <Stack direction="row" spacing={1}>
          <Box>{booking && fDate(booking?.doctorTimeSlot?.doctorAvailability?.startDate)}</Box>
          <Box>{booking && fTime(booking?.doctorTimeSlot?.slotStart)}</Box>
        </Stack>
      </Stack>
      {/* <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Payment time</Box>
        {booking && fDateTime(booking?.createdAt)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Completion time</Box>
        {booking && fDateTime(booking?.createdAt)}
      </Stack> */}
    </Stack>
  );

  const renderTimeline = (
    <Timeline
      sx={{
        p: 0,
        m: 0,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {(() => {
        // sort by createdAt
        const sortedHistory = [...history].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        const hasCancelled = sortedHistory.some((h) => h.status === 3);
        // Build dynamic steps
        let steps = [];

        // Always start with Pending
        const pendingStep = sortedHistory.find((h) => h.status === 0);
        if (pendingStep) steps.push(pendingStep);

        // Add all reschedules in order
        const reschedules = sortedHistory.filter((h) => h.status === 1);
        steps = [...steps, ...reschedules];

        // Add Completed or Cancelled
        if (hasCancelled) {
          const cancelled = sortedHistory.find((h) => h.status === 3);
          if (cancelled) steps.push(cancelled);
        } else {
          const completed = sortedHistory.find((h) => h.status === 2);
          if (completed) steps.push(completed);
        }

        return steps.map((step, index) => {
          let color = 'grey';

          if (hasCancelled) {
            // if cancelled → everything red
            color = 'error';
          } else {
            // normal coloring
            if (step.status === 0 || step.status === 2) color = 'success';
            if (step.status === 1) color = 'success';
          }

          return (
            <TimelineItem key={step.id}>
              <TimelineSeparator>
                <TimelineDot color={color} />
                {index !== steps.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Typography variant="subtitle2" fontWeight="medium">
                  {BOOKING_HISTORY_STATUS_OPTIONS.find((opt) => opt.value === String(step.status))
                    ?.label || 'Unknown'}
                </Typography>
                <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                  {fDate(step.createdAt)} {fTime(step.createdAt)}
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        });
      })()}
    </Timeline>
  );

  return (
    <Card>
      <CardHeader
        title="Status"
        action={
          <Label color={booking?.isPaid ? 'success' : 'error'} variant="soft">
            {booking?.isPaid ? 'Paid' : 'Unpaid'}
          </Label>
        }
      />
      <Stack
        spacing={3}
        alignItems={{ md: 'flex-start' }}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{ p: 3 }}
      >
        {renderTimeline}

        {renderSummary}
      </Stack>
    </Card>
  );
}

BookingDetailsHistory.propTypes = {
  history: PropTypes.array,
  booking: PropTypes.object,
};

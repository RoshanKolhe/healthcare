'use client';

/* eslint-disable no-nested-ternary */
import Calendar from '@fullcalendar/react'; // => request placed at the top
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
//
import { useState, useEffect, useCallback, useMemo } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
// utils
import { fTimestamp } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// _mock
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
// api
import { updateDoctorAvailability, useGetDoctorAvailabilities } from 'src/api/doctor-availability';
// components
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from 'src/components/settings';
import { StyledCalendar } from 'src/sections/calendar/styles';
import { getMatchingDates } from 'src/auth/context/jwt/utils';
import { useParams } from 'next/navigation';
import { useGetDoctor } from 'src/api/doctor';
import { useDoctorCalendar, useDoctorEvent } from 'src/sections/doctor/hooks';
import { isBefore, startOfDay } from 'date-fns';
import { useAuthContext } from 'src/auth/hooks';
import { FormControlLabel, Switch } from '@mui/material';
import axiosInstance from 'src/utils/axios';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CalendarFiltersResult from '../doctor-calendar-filters-result';
import CalendarForm from '../doctor-calendar-form';
import CalendarToolbar from '../doctor-calendar-toolbar';
import CalendarFilters from '../doctor-calendar-filters';

// ----------------------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

function getCalendarActiveRange(calendarRef) {
  const api = calendarRef?.current?.getApi?.();
  if (!api) {
    const today = new Date();
    return { start: today, end: new Date(today.getTime() + 30 * 86400000) };
  }
  const view = api.view;
  return {
    start: view.activeStart, // Date object
    end: view.activeEnd, // Date object
  };
}
// ----------------------------------------------------------------------

export default function CalendarView() {
  const theme = useTheme();

  const settings = useSettingsContext();

  const smUp = useResponsive('up', 'sm');

  const openFilters = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const { user } = useAuthContext();
  const userRole = user?.permissions?.[0];
  const params = useParams();
  const { id: paramId } = params;

  const targetDoctorId = userRole === 'doctor' ? user.id : paramId;

  const { doctor: currentDoctor } = useGetDoctor(targetDoctorId);
  const { doctorAvailabilities, doctorAvailabilitiesLoading, refreshDoctorAvailabilities } =
    useGetDoctorAvailabilities({ id: targetDoctorId });
  console.log('DEBUG allAvailabilities:', doctorAvailabilities);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  } = useDoctorCalendar();

  const currentEvent = useDoctorEvent(doctorAvailabilities, selectEventId, selectedRange, openForm);
  console.log('check event id:', selectEventId);
  console.log('check event currentEvent:', currentEvent);

  const isPastDate = useCallback((checkDate) => {
    if (!checkDate) return false;

    const now = new Date();
    const eventDateTime = new Date(checkDate);

    const today = startOfDay(now);
    const eventDay = startOfDay(eventDateTime);

    if (eventDay < today) return true;
    if (eventDay > today) return false;

    const diffMs = eventDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours < 2; 
  }, []);

  const isEventInPast = useMemo(() => {
    if (!currentEvent) return false;
    return isPastDate(currentEvent.startTime || currentEvent.startDate || currentEvent.start);
  }, [currentEvent, isPastDate]);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const canReset = !!filters.colors.length || (!!filters.startDate && !!filters.endDate);

  const dataFiltered = applyFilter({
    inputData: doctorAvailabilities,
    filters,
    dateError,
  });

  const { start: activeStart, end: activeEnd } = getCalendarActiveRange(calendarRef);
  const expandedEvents = expandDoctorAvailabilities(dataFiltered, activeStart, activeEnd);

  const renderResults = (
    <CalendarFiltersResult
      filters={filters}
      onFilters={handleFilters}
      //
      canReset={canReset}
      onResetFilters={handleResetFilters}
      //
      results={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  const [isAvailable, setIsAvailable] = useState(true);

  const handleToggle = async (event) => {
    const newValue = event.target.checked;
    setIsAvailable(newValue);

    const today = new Date().toISOString().split('T')[0];
    const doctorId = doctorAvailabilities?.[0]?.doctorId;

    const inputData = {
      doctorId,
      date: today,
      isAvailable: newValue,
    };

    try {
      const res = await axiosInstance.post('/doctor-availabilities/toggle-availability', inputData);
      console.log('Toggle response:', res.data);
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  useEffect(() => {
    if (!doctorAvailabilities || doctorAvailabilities.length === 0) return;

    const today = new Date().toLocaleDateString('en-CA'); // Local date in YYYY-MM-DD

    const todaysAvailability = doctorAvailabilities.find((av) => {
      const localDate = new Date(av.startDate).toLocaleDateString('en-CA');
      return localDate === today;
    });

    console.log('today', today);
    console.log('todaysAvailability', todaysAvailability);

    if (!todaysAvailability) {
      setIsAvailable(true); // No slots found = assume available
      return;
    }

    const slots = todaysAvailability.doctorTimeSlots || [];

    // If there are slots and all are cancelled (isBooked === 2) => doctor is OFF
    const allCancelled = slots.length > 0 && slots.every((slot) => slot.isBooked === 2);
    console.log('allCancelled', allCancelled);

    setIsAvailable(!allCancelled);
  }, [doctorAvailabilities]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Doctor Calendar"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Doctor',
              href: paths.dashboard.doctor.list,
            },
            { name: 'Schedule' },
          ]}
          action={
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={<Switch checked={isAvailable} onChange={handleToggle} color="success" />}
                label={isAvailable ? 'Available' : 'Not Available'}
              />
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={onOpenForm}
              >
                New Schedule
              </Button>
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {canReset && renderResults}

        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              loading={doctorAvailabilitiesLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={openFilters.onTrue}
            />

            <Calendar
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              // eventDisplay="block"
              events={expandedEvents}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              height={smUp ? 720 : 'auto'}
              eventDrop={(arg) => {
                if (isPastDate(arg.event.start)) return;
                arg.revert();
                onDropEvent(arg, updateDoctorAvailability);
              }}
              eventResize={(arg) => {
                if (isPastDate(arg.event.start)) return;
                arg.revert();
                onResizeEvent(arg, updateDoctorAvailability);
              }}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
            />
          </StyledCalendar>
        </Card>
      </Container>

      <Dialog
        fullWidth
        maxWidth={false}
        open={openForm}
        onClose={onCloseForm}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Edit Schedule' : 'New Schedule'}</>}
        </DialogTitle>

        <CalendarForm
          currentEvent={currentEvent}
          selectEventId={selectEventId}
          refreshDoctorAvailabilities={refreshDoctorAvailabilities}
          selectedRange={selectedRange}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
          currentDoctor={currentDoctor}
          isReadOnly={isEventInPast}
        />
      </Dialog>

      <CalendarFilters
        open={openFilters.value}
        onClose={openFilters.onFalse}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        canReset={canReset}
        onResetFilters={handleResetFilters}
        //
        dateError={dateError}
        //
        events={doctorAvailabilities}
        colorOptions={CALENDAR_COLOR_OPTIONS}
        onClickEvent={onClickEventInFilters}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters, dateError }) {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (event) =>
          fTimestamp(event.startTime) >= fTimestamp(startDate) &&
          fTimestamp(event.endTime) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}

function expandDoctorAvailabilities(availabilities, rangeStart, rangeEnd) {
  const events = [];

  // Utility functions
  const clampToDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => {
    const result = new Date(d);
    result.setDate(result.getDate() + n);
    return result;
  };
  const inRange = (d, start, end) => d >= clampToDay(start) && d <= clampToDay(end);

  const eachDayBetween = (start, end) => {
    const days = [];
    let current = clampToDay(start);
    const lastDay = clampToDay(end);

    while (current <= lastDay) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    return days;
  };

  // Normalize day indices to 0..6 (Sun=0..Sat=6)
  const normalizeDaysOfWeek = (dayValue) => {
    if (Array.isArray(dayValue)) {
      return dayValue.map((d) => d % 7);
    }
    if (typeof dayValue === 'number') {
      return [dayValue % 7];
    }
    return [];
  };

  availabilities.forEach((availability) => {
    // Skip inactive schedules
    if (!availability?.isActive) return;

    // Get schedule date range from the form
    const scheduleStart = availability.startDate
      ? clampToDay(new Date(availability.startDate))
      : null;
    const scheduleEnd = availability.endDate ? clampToDay(new Date(availability.endDate)) : null;

    // Skip if no date range is specified
    if (!scheduleStart || !scheduleEnd) return;

    // Check if it's a single day appointment (startDate === endDate)
    const isSingleDay = scheduleStart.getTime() === scheduleEnd.getTime();

    // Get selected days of week (from form's dayOfWeek selection)
    const selectedDays = normalizeDaysOfWeek(availability.dayOfWeek || []);

    // Default endTime to 23:59 if missing
    const endTime = availability.endTime || new Date().setHours(23, 59, 0, 0);

    // Pre-compute time components for performance
    const startTimeObj = new Date(availability.startTime);
    const endTimeObj = new Date(endTime);
    const startHours = startTimeObj.getHours();
    const startMinutes = startTimeObj.getMinutes();
    const endHours = endTimeObj.getHours();
    const endMinutes = endTimeObj.getMinutes();

    // For single day appointments, create just one event regardless of dayOfWeek selection
    if (isSingleDay) {
      // Check if the single day is within visible calendar range
      if (!inRange(scheduleStart, rangeStart, rangeEnd)) return;

      const startDateTime = new Date(scheduleStart);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(scheduleStart);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const dateString = scheduleStart.toISOString().split('T')[0];
      const occurrenceId = `${availability.id || 'temp'}::${dateString}`;

      events.push({
        id: occurrenceId,
        title: `${availability.doctor?.firstName || ''} ${availability.doctor?.lastName || ''} - ${
          availability.branch?.name || ''
        }`,
        start: startDateTime,
        end: endDateTime,
        color: availability.color || '#00AB55',
        availabilityId: availability.id,
        originalAvailability: availability,
        isSingleDay: true,
        dayOfWeek: scheduleStart.getDay(),
        dateString,
      });
      return; // Skip the recurring logic for single day appointments
    }

    // For date ranges (recurring appointments)
    // Determine effective generation window
    // Use the intersection of schedule range and visible calendar range
    const effectiveStart = new Date(
      Math.max(scheduleStart.getTime(), clampToDay(rangeStart).getTime())
    );
    const effectiveEnd = new Date(Math.min(scheduleEnd.getTime(), clampToDay(rangeEnd).getTime()));

    // Skip if no overlap with visible range
    if (effectiveStart > effectiveEnd) return;

    // Generate all days in the effective range
    const allDays = eachDayBetween(effectiveStart, effectiveEnd);

    allDays.forEach((day) => {
      const dayOfWeek = day.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

      // Skip if this day is not in the selected days
      // If no specific days are selected, include all days
      if (selectedDays.length > 0 && !selectedDays.includes(dayOfWeek)) {
        return;
      }

      // Create start and end datetime for this occurrence
      const startDateTime = new Date(day);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(day);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Create unique ID per occurrence to prevent duplicates
      const dateString = day.toISOString().split('T')[0];
      const occurrenceId = `${availability.id || 'temp'}::${dateString}`;

      // Create the calendar event
      events.push({
        id: occurrenceId,
        title: `${availability.doctor?.firstName || ''} ${availability.doctor?.lastName || ''} - ${
          availability.branch?.name || ''
        }`,
        start: startDateTime,
        end: endDateTime,
        color: availability.color || '#00AB55',
        // Include reference data
        availabilityId: availability.id,
        originalAvailability: availability,
        isSingleDay: false,
        dayOfWeek,
        dateString,
      });
    });
  });

  return events;
}

// Alternative version if you prefer more explicit day handling
function expandDoctorAvailabilitiesExplicit(availabilities, rangeStart, rangeEnd) {
  const events = [];

  availabilities.forEach((availability) => {
    if (!availability?.isActive) return;

    const startDate = availability.startDate ? new Date(availability.startDate) : null;
    const endDate = availability.endDate ? new Date(availability.endDate) : null;

    if (!startDate || !endDate) return;

    // Handle form's dayOfWeek structure (could be array or single value)
    let selectedDays = [];
    if (Array.isArray(availability.dayOfWeek)) {
      selectedDays = availability.dayOfWeek;
    } else if (typeof availability.dayOfWeek === 'number') {
      selectedDays = [availability.dayOfWeek];
    } else if (availability.dayOfWeek?.value) {
      // Handle form option structure like { id: 1, label: 'Monday-Friday', value: [1,2,3,4,5] }
      selectedDays = availability.dayOfWeek.value;
    }

    // Normalize to 0-6 range
    selectedDays = selectedDays.map((day) => day % 7);

    const startTime = new Date(availability.startTime);
    const endTime = new Date(availability.endTime || new Date().setHours(23, 59, 0, 0));

    // Iterate through each day in the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Check if this day should be included
      if (selectedDays.length === 0 || selectedDays.includes(dayOfWeek)) {
        // Check if within visible calendar range
        if (
          currentDate >=
            new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate()) &&
          currentDate <= new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate())
        ) {
          const eventStart = new Date(currentDate);
          eventStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

          const eventEnd = new Date(currentDate);
          eventEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

          const dateString = currentDate.toISOString().split('T')[0];

          events.push({
            id: `${availability.id}::${dateString}`,
            title: `${availability.doctor?.firstName || ''} ${
              availability.doctor?.lastName || ''
            } - ${availability.branch?.name || ''}`,
            start: eventStart,
            end: eventEnd,
            color: availability.color || '#00AB55',
            availabilityId: availability.id,
            originalAvailability: availability,
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return events;
}

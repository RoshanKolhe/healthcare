import { useState, useCallback, useRef } from 'react';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// utils
import { fTimestamp } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function useDoctorCalendar() {
  const calendarRef = useRef(null);

  const calendarEl = calendarRef.current;

  const smUp = useResponsive('up', 'sm');

  const [date, setDate] = useState(new Date());

  const [openForm, setOpenForm] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState(null);

  const [view, setView] = useState(smUp ? 'dayGridMonth' : 'listWeek');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      const newView = smUp ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);

  const onChangeView = useCallback(
    (newView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback(
    (arg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
        calendarApi.unselect();
      }
      const start = new Date(arg.start);
      let end = new Date(arg.start);

      if (start.getTime() === end.getTime() || end <= start) {
        end = start;
      }

      setSelectedRange({
        startDate: start,
        endDate: end,
        startTime: start,
        endTime: end,
      });

      onOpenForm();
    },
    [calendarEl, onOpenForm]
  );

  const onClickEvent = useCallback(
    (info) => {
      const originalId = info.event.id.split('::')[0]; // get backend availability id
      setSelectEventId(originalId);

      setSelectedRange({
        startDate: info.event.start,
        endDate: info.event.end,
        startTime: info.event.start,
        endTime: info.event.end,
      });
      onOpenForm();
    },
    [setSelectEventId, setSelectedRange, onOpenForm]
  );

  const onResizeEvent = useCallback((arg, updateDoctorAvailability) => {
    const { event } = arg;

    updateDoctorAvailability({
      id: event.id,
      startTime: fTimestamp(event.start),
      endTime: fTimestamp(event.end),
      isActive: true,
    });
  }, []);

  const onDropEvent = useCallback((arg, updateDoctorAvailability) => {
    const { event } = arg;

    updateDoctorAvailability({
      id: event.id,
      startTime: fTimestamp(event.start),
      endTime: fTimestamp(event.end),
      isActive: true,
    });
  }, []);

  const onClickEventInFilters = useCallback(
    (eventId) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
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
  };
}

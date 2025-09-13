import { useMemo } from 'react';

export default function useDoctorEvent(
  doctorAvailabilities,
  selectEventId,
  selectedRange,
  openForm,
  branches = []
) {
  const currentEvent = doctorAvailabilities?.find(
    (event) => event.id === Number(selectEventId)
  );

  const defaultValues = useMemo(
    () => ({
      daysOfWeek: selectedRange ? [selectedRange.startDate.getDay()] : [],
      customDays: [],
      startDate: selectedRange?.startDate || '',
      endDate: selectedRange?.endDate || '',
      startTime: selectedRange?.startTime || '',
      endTime: selectedRange?.endTime || '',
      branch: currentEvent?.branch || null,
      doctorId: currentEvent?.doctorId || '',
      isActive: true,
      slotCount: 0,
      doctorTimeSlots: [],
    }),
    [selectedRange, currentEvent]
  );

  const branchOptions = useMemo(() => {
    if (!currentEvent?.branch) return branches;
    return [
      currentEvent.branch,
      ...branches.filter((b) => b.id !== currentEvent.branch.id),
    ];
  }, [branches, currentEvent]);

  if (!openForm) return defaultValues;

  if (currentEvent) {
    const mappedSlots = (currentEvent.doctorTimeSlots || []).map((s) => ({
      id: s.id,
      slotStart: s.slotStart ? new Date(s.slotStart) : null,
      slotEnd: s.slotEnd ? new Date(s.slotEnd) : null,
      duration:
        s.duration ||
        (s.slotStart && s.slotEnd
          ? Math.round(
              (new Date(s.slotEnd) - new Date(s.slotStart)) / 60000
            )
          : 0),
      isBooked: s.isBooked,
      isActive: s.isActive !== undefined ? s.isActive : true,
    }));

    return {
      id: currentEvent.id,
      daysOfWeek: currentEvent.dayOfWeek || [],
      customDays: currentEvent.dayOfWeek || [],
      startDate: currentEvent.startDate ? new Date(currentEvent.startDate) : defaultValues.startDate,
      endDate: currentEvent.endDate ? new Date(currentEvent.endDate) : defaultValues.endDate,
      startTime: currentEvent.startTime ? new Date(currentEvent.startTime) : defaultValues.startTime,
      endTime: currentEvent.endTime ? new Date(currentEvent.endTime) : defaultValues.endTime,
      branch: currentEvent.branch,            // current branch
      doctorId: currentEvent.doctorId,        // from currentEvent
      isActive: currentEvent.isActive !== undefined ? currentEvent.isActive : defaultValues.isActive,
      slotCount: currentEvent.doctorTimeSlots?.length || 0, // from currentEvent
      doctorTimeSlots: mappedSlots,
      branchOptions,                          // mapped with current branch first
    };
  }

  return { ...defaultValues, branchOptions };
}


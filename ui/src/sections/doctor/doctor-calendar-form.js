/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
// utils
import { fTimestamp } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ColorPicker } from 'src/components/color-utils';
import FormProvider, {
  RHFAutocomplete,
  RHFMultiCheckbox,
  RHFTextField,
} from 'src/components/hook-form';
import { Button, Chip, Typography } from '@mui/material';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

const dayOptions = [
  { id: 1, label: 'Monday - Friday', value: [1, 2, 3, 4, 5] },
  { id: 2, label: 'Saturday - Sunday', value: [6, 0] },
  { id: 3, label: 'Monday, Tuesday, Wednesday', value: [1, 2, 3] },
  { id: 4, label: ' Thursday , Friday', value: [4, 5] },
  { id: 5, label: 'Custom', value: [] },
];

const dayNames = [
  { id: 0, value: 0, label: 'Sunday' },
  { id: 1, value: 1, label: 'Monday' },
  { id: 2, value: 2, label: 'Tuesday' },
  { id: 3, value: 3, label: 'Wednesday' },
  { id: 4, value: 4, label: 'Thursday' },
  { id: 5, value: 5, label: 'Friday' },
  { id: 6, value: 6, label: 'Saturday' },
];

// ----------------------------------------------------------------------

export default function CalendarForm({
  currentEvent,
  selectedRange,
  colorOptions,
  onClose,
  currentDoctor,
  refreshDoctorAvailabilities,
  events,
  selectEventId,
  openForm,
  isReadOnly,
}) {
  console.log('show currentEvent in form', currentEvent);
  console.log('show isReadOnly in form', isReadOnly);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedOption, setSelectedOption] = useState(null);
  const [customDays, setCustomDays] = useState([]);
  const [prevEventId, setPrevEventId] = useState(currentEvent?.id);

  const EventSchema = Yup.object().shape({
    branch: Yup.object().required('Branch is required'),
    dayOfWeek: Yup.object().required('Days are required'),
    customDays: Yup.array().of(Yup.number().min(0).max(6)).nullable(),
    startDate: Yup.mixed().required('Start date is required'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date cannot be before start date'),
    startTime: Yup.mixed().required('Start time is required'),
    endTime: Yup.date()
      .required('End time is required')
      .when('startTime', (startTime, schema) =>
        startTime ? schema.min(startTime, 'End time cannot be before start time') : schema
      ),
    slotCount: Yup.number().min(0).nullable(),
    doctorTimeSlots: Yup.array().of(
      Yup.object().shape({
        slotStart: Yup.mixed().nullable(),
        slotEnd: Yup.mixed().nullable(),
        duration: Yup.number().min(0).nullable(),
        isBooked: Yup.boolean(),
        isActive: Yup.boolean(),
      })
    ),
  });

  const defaultValues = useMemo(() => {
    if (!currentEvent) {
      return {
        dayOfWeek: [], // must be object, not []
        customDays: [],
        startDate: selectedRange?.startDate || null,
        endDate: selectedRange?.endDate || null,
        startTime: selectedRange?.startTime || null,
        endTime: selectedRange?.endTime || null,
        branch: currentEvent?.branch || null,
        doctorId: currentDoctor?.id || '',
        isActive: true,
        slotCount: 0,
        doctorTimeSlots: [],
      };
    }

    const mappedSlots = (currentEvent.doctorTimeSlots || []).map((s) => ({
      id: s.id,
      slotStart: s.slotStart ? new Date(s.slotStart) : null,
      slotEnd: s.slotEnd ? new Date(s.slotEnd) : null,
      duration:
        s.duration ||
        (s.slotStart && s.slotEnd
          ? Math.round((new Date(s.slotEnd) - new Date(s.slotStart)) / 60000)
          : 0),
      isBooked: s.isBooked,
      isActive: s.isActive !== undefined ? s.isActive : true,
    }));

    // Map currentEvent.daysOfWeek array back to one of dayOptions
    console.log('dayOptions options', dayOptions);
    const matchedOption = dayOptions.find(
      (opt) =>
        opt.value.length === currentEvent.daysOfWeek?.length &&
        opt.value.every((d) => currentEvent.daysOfWeek.includes(d))
    ) || {
      id: 5,
      label: 'Custom',
      value: currentEvent.daysOfWeek || [],
    };

    console.log('aaaaa', matchedOption, currentEvent);
    return {
      id: currentEvent.id,
      dayOfWeek: matchedOption && currentEvent?.daysOfWeek?.length > 0 ? matchedOption : undefined,
      customDays: currentEvent.daysOfWeek?.length ? currentEvent.daysOfWeek : [],
      startDate: currentEvent.startDate ? new Date(currentEvent.startDate) : null,
      endDate: currentEvent.endDate ? new Date(currentEvent.endDate) : null,
      startTime: currentEvent.startTime ? new Date(currentEvent.startTime) : null,
      endTime: currentEvent.endTime ? new Date(currentEvent.endTime) : null,
      branch: currentEvent.branch || null,
      doctorId: currentEvent.doctorId || currentDoctor?.id || '',
      isActive: currentEvent.isActive !== undefined ? currentEvent.isActive : true,
      slotCount: mappedSlots.length,
      doctorTimeSlots: mappedSlots,
    };
  }, [currentEvent, selectedRange, currentDoctor]);

  console.log('show defaultValues', defaultValues);

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting, errors },
  } = methods;
  console.log('show form errors', errors);
  const { fields: slotFields, replace } = useFieldArray({
    control,
    name: 'doctorTimeSlots',
  });

  const values = watch();
  const role = watch('role');

  const slotCount = watch('slotCount') || 0;
  const availabilityStart = watch('startTime');
  const availabilityEnd = watch('endTime');

  const dateError = values.start && values.end ? values.start > values.end : false;

  const addMinutes = (date, minutes) => {
    if (!date) return null;
    return new Date(date.getTime() + minutes * 60000);
  };

  const diffMinutes = (a, b) => {
    if (!a || !b) return 0;
    return Math.round((b.getTime() - a.getTime()) / 60000);
  };

  const generateInitialSlots = (start, end, count) => {
    if (!start || !end || !count || count <= 0) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const totalMs = endDate.getTime() - startDate.getTime();
    if (totalMs <= 0) return [];

    const baseMs = Math.floor(totalMs / count);
    const doctorTimeSlots = [];
    let cursor = new Date(startDate);

    for (let i = 0; i < count; i++) {
      const s = new Date(cursor);
      let e = i === count - 1 ? new Date(endDate) : new Date(cursor.getTime() + baseMs);
      if (e.getTime() > endDate.getTime()) e = new Date(endDate);
      const duration = Math.max(0, diffMinutes(s, e));
      doctorTimeSlots.push({
        slotStart: new Date(s),
        slotEnd: new Date(e),
        duration,
        isBooked: false,
        isActive: true,
      });
      cursor = new Date(e);
      if (cursor.getTime() >= endDate.getTime()) break;
    }
    return doctorTimeSlots;
  };

  const recalcFollowingSlots = (baseSlots, changedIndex) => {
    const availabilityEndDate = availabilityEnd ? new Date(availabilityEnd) : null;
    const updated = baseSlots.map((s) => ({ ...s }));

    for (let i = changedIndex + 1; i < updated.length; i++) {
      const prev = updated[i - 1];
      if (!prev || !prev.slotEnd) {
        updated.splice(i); // drop the rest
        break;
      }
      const newStart = new Date(prev.slotEnd);
      const dur =
        updated[i].duration && updated[i].duration > 0
          ? updated[i].duration
          : updated[i].slotStart && updated[i].slotEnd
          ? diffMinutes(new Date(updated[i].slotStart), new Date(updated[i].slotEnd))
          : 0;

      const proposedEnd = addMinutes(newStart, dur);

      if (availabilityEndDate && newStart.getTime() >= availabilityEndDate.getTime()) {
        updated.splice(i);
        break;
      }

      if (availabilityEndDate && proposedEnd.getTime() > availabilityEndDate.getTime()) {
        updated[i].slotStart = newStart;
        updated[i].slotEnd = new Date(availabilityEndDate);
        updated[i].duration = diffMinutes(updated[i].slotStart, updated[i].slotEnd);
        updated.splice(i + 1);
        break;
      }
      updated[i].slotStart = newStart;
      updated[i].slotEnd = proposedEnd;
      updated[i].duration = diffMinutes(updated[i].slotStart, updated[i].slotEnd);
    }

    return updated;
  };

  const handleSlotStartChange = (index, newStart) => {
    if (!newStart) return;
    const availabilityEndDate = availabilityEnd ? new Date(availabilityEnd) : null;
    const updated = getValues('doctorTimeSlots') || [];

    const availStartDate = availabilityStart ? new Date(availabilityStart) : null;
    if (availStartDate && newStart.getTime() < availStartDate.getTime()) {
      newStart = new Date(availStartDate);
    }
    const prevDuration =
      updated[index].duration && updated[index].duration > 0
        ? updated[index].duration
        : updated[index].slotStart && updated[index].slotEnd
        ? diffMinutes(new Date(updated[index].slotStart), new Date(updated[index].slotEnd))
        : 0;

    const newEnd = addMinutes(newStart, prevDuration);
    if (availabilityEndDate && newEnd.getTime() > availabilityEndDate.getTime()) {
      updated[index].slotStart = newStart;
      updated[index].slotEnd = new Date(availabilityEndDate);
      updated[index].duration = diffMinutes(updated[index].slotStart, updated[index].slotEnd);
      const trimmed = updated.slice(0, index + 1);
      replace(trimmed);
      setValue('slotCount', trimmed.length);
      return;
    }

    updated[index].slotStart = new Date(newStart);
    updated[index].slotEnd = new Date(newEnd);
    updated[index].duration = diffMinutes(updated[index].slotStart, updated[index].slotEnd);

    const recalculated = recalcFollowingSlots(updated, index);
    replace(recalculated);
    setValue('slotCount', recalculated.length);
  };

  const validateTotalTime = (slots) => {
    const totalMinutes = diffMinutes(availabilityStart, availabilityEnd);
    const usedMinutes = slots.reduce((sum, s) => sum + (s.duration || 0), 0);
    return usedMinutes <= totalMinutes;
  };

  const handleSlotEndChange = (index, newEnd) => {
    if (!newEnd) return;
    const availabilityEndDate = availabilityEnd ? new Date(availabilityEnd) : null;
    const base = getValues('doctorTimeSlots') || [];
    const updated = base.map((s) => ({ ...s }));

    const slotStart = updated[index].slotStart ? new Date(updated[index].slotStart) : null;
    if (!slotStart) return;

    const newDuration = Math.max(0, diffMinutes(slotStart, newEnd));
    updated[index].slotEnd = new Date(newEnd);
    updated[index].duration = newDuration;

    const recalculated = recalcFollowingSlots(updated, index);

    if (!validateTotalTime(recalculated)) {
      enqueueSnackbar('Total slots exceed availability time!', { variant: 'error' });
      return;
    }

    replace(recalculated);
    setValue('slotCount', recalculated.length);
  };

  console.log('currentEvent id:', currentEvent?.id);
  const onSubmit = handleSubmit(async (formData) => {
    const slots = formData.doctorTimeSlots || [];
    if (!validateTotalTime(slots)) {
      enqueueSnackbar('Slots total time mismatch with availability!', { variant: 'error' });
      return;
    }
    if (isReadOnly) {
      enqueueSnackbar('Cannot edit past events or events starting in less than 2 hours', {
        variant: 'warning',
      });
      return;
    }
    try {
      console.log('submit form data', formData);
      const toDate = (val) => (val ? new Date(val) : null);
      const inputData = {
        // dayOfWeek: formData.dayOfWeek?.value || [],
        dayOfWeek:
          formData.dayOfWeek?.label === 'Custom'
            ? formData.customDays || []
            : formData.dayOfWeek?.value || [],
        startDate: toDate(formData.startDate)?.toISOString(),
        endDate: toDate(formData.endDate)?.toISOString(),
        startTime: toDate(formData.startTime)?.toISOString(),
        endTime: toDate(formData.endTime)?.toISOString(),
        branchId: formData.branch?.id || null,
        doctorId: currentDoctor?.id,
        isActive: true,
        // map slots to backend model
        doctorTimeSlots: (formData.doctorTimeSlots || []).map((s) => ({
          slotStart: toDate(s.slotStart)?.toISOString() || null,
          slotEnd: toDate(s.slotEnd)?.toISOString() || null,
          duration:
            s.duration ||
            (s.slotStart && s.slotEnd ? diffMinutes(toDate(s.slotStart), toDate(s.slotEnd)) : 0),
          isBooked: s.isBooked,
          isActive: s.isActive !== undefined ? s.isActive : true,
        })),
      };

      if (!currentEvent.id) {
        await axiosInstance.post('/doctor-availabilities', inputData);
      } else {
        await axiosInstance.patch(`/doctor-availabilities/${currentEvent.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentEvent ? 'Update success!' : 'Create success!');
      refreshDoctorAvailabilities();
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error?.message, {
        variant: 'error',
      });
    }
  });

  const onDelete = useCallback(async () => {
    try {
      await axiosInstance.delete(`/doctor-availabilities/${currentEvent?.id}`);
      enqueueSnackbar('Delete success!');
      refreshDoctorAvailabilities();
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [currentEvent?.id, enqueueSnackbar, onClose]);

  useEffect(() => {
    if (!availabilityStart || !availabilityEnd || slotCount === undefined) return;

    const startDate = new Date(availabilityStart);
    const endDate = new Date(availabilityEnd);

    const currentSlots = getValues('doctorTimeSlots') || [];

    if (currentSlots.length !== slotCount) {
      const newSlots = generateInitialSlots(startDate, endDate, slotCount);
      replace(newSlots);
    }
  }, [slotCount, availabilityStart, availabilityEnd, getValues, generateInitialSlots, replace]);

  useEffect(() => {
    if (currentEvent) {
      const matchedOption = dayOptions.find(
        (opt) =>
          opt.value.length === currentEvent.daysOfWeek?.length &&
          opt.value.some((d) => currentEvent.daysOfWeek.includes(d))
      );
      console.log('match options', matchedOption);

      if (matchedOption) {
        setSelectedOption(matchedOption);
        setValue('dayOfWeek', matchedOption);
        setCustomDays([]); // clear custom
      } else if (currentEvent.daysOfWeek?.length === 1) {
        const singleDay = dayNames.find((d) => d.value[0] === currentEvent.daysOfWeek[0]);
        if (singleDay) {
          setSelectedOption(singleDay);
          setValue('dayOfWeek', singleDay);
          setCustomDays([]); // reset custom
        }
      } else {
        setSelectedOption(dayOptions.find((opt) => opt.label === 'Custom'));
        setValue('dayOfWeek', {
          id: 5,
          label: 'Custom',
          value: currentEvent.daysOfWeek || [],
        });
        setCustomDays(currentEvent.daysOfWeek || []);
      }
    }
  }, [currentEvent, setValue]);
  console.log('selectedOption', selectedOption);
  console.log('values', values);

  useEffect(() => {
    if (role === 'clinic') {
      setValue('branch', null);
    }
  }, [role, setValue]);

  useEffect(() => {
    if (currentEvent?.id !== prevEventId) {
      reset(defaultValues);
      setPrevEventId(currentEvent?.id);
    }
  }, [currentEvent?.id, defaultValues, reset, prevEventId]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Box
        mt={2}
        rowGap={3}
        columnGap={2}
        m={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        <RHFAutocomplete
          name="branch"
          label="Branch"
          options={currentDoctor?.branches || []}
          getOptionLabel={(option) => option?.name || ''}
          filterOptions={(x) => x}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderOption={(props, option) => (
            <li {...props}>
              <Typography variant="subtitle2" fontWeight="bold">
                {option?.name}
              </Typography>
            </li>
          )}
          renderTags={(selected, getTagProps) =>
            selected?.map((option, tagIndex) => (
              <Chip
                {...getTagProps({ index: tagIndex })}
                key={option?.id}
                label={option?.name}
                size="small"
                color="info"
                variant="soft"
              />
            ))
          }
          disabled={isReadOnly}
        />

        <RHFAutocomplete
          name="dayOfWeek"
          label="Days"
          options={dayOptions}
          // value={selectedOption}
          onChange={(_, value) => {
            setSelectedOption(value || null);

            if (!value) {
              setValue('dayOfWeek', []);
              setCustomDays([]);
              return;
            }

            if (value.label !== 'Custom') {
              setCustomDays([]);
              setValue('dayOfWeek', value); // store the preset option in RHF
            } else {
              setValue('dayOfWeek', { id: 5, label: 'Custom', value: customDays });
            }
          }}
          getOptionLabel={(option) => option?.label || ''}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          disabled={isReadOnly}
        />

        {values.dayOfWeek && values.dayOfWeek.label === 'Custom' && (
          <Box sx={{ gridColumn: '1 / -1', width: '100%' }}>
            <RHFMultiCheckbox
              name="customDays"
              label="Select Days"
              options={dayNames.map((d) => ({ label: d.label, value: d.value }))}
              row
              spacing={2}
              helperText="Select one or more days"
              sx={{
                mt: 2,
                width: '100%', // make the wrapper full width
                display: 'flex', // allow row layout
                flexWrap: 'wrap', // so checkboxes wrap nicely
                justifyContent: 'space-between', // spread them out
              }}
              disabled={isReadOnly}
            />
          </Box>
        )}

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <MobileDatePicker
              {...field}
              value={field.value ? new Date(field.value) : null}
              onChange={(newValue) => {
                if (newValue) field.onChange(newValue); // store Date directly
              }}
              label="Start Date"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
              disabled={isReadOnly}
            />
          )}
        />

        <Controller
          name="endDate"
          control={control}
          render={({ field, fieldState }) => (
            <MobileDatePicker
              {...field}
              value={field.value ? new Date(field.value) : null}
              onChange={(newValue) => {
                if (newValue) field.onChange(newValue); // store Date directly
              }}
              label="End Date"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
              disabled={isReadOnly}
            />
          )}
        />

        <Controller
          name="startTime"
          control={control}
          render={({ field }) => (
            <MobileTimePicker
              {...field}
              value={field.value ? new Date(field.value) : null}
              onChange={(newValue) => {
                if (newValue) field.onChange(newValue); // store Date directly
              }}
              label="Start time"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
              disabled={isReadOnly}
            />
          )}
        />
        <Controller
          name="endTime"
          control={control}
          render={({ field, fieldState }) => (
            <MobileTimePicker
              {...field}
              value={field.value ? new Date(field.value) : null}
              onChange={(newValue) => {
                if (newValue) field.onChange(newValue); // store Date directly
              }}
              label="End time"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
              disabled={isReadOnly}
            />
          )}
        />
        <RHFTextField
          name="slotCount"
          label="How many slots"
          type="number"
          inputProps={{ min: 0 }}
          fullWidth
          disabled={isReadOnly}
        />
        <Controller
          name="doctorTimeSlots"
          control={control}
          render={({ field }) => (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="subtitle2" sx={{ mb: 3 }}>
                Slots
              </Typography>

              {slotFields.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No slots generated yet. Set How many slots and availability times.
                </Typography>
              )}
              {slotFields.map((slot, idx) => {
                const currentSlot = (getValues('doctorTimeSlots') || [])[idx] || slot;
                const duration =
                  currentSlot?.slotStart && currentSlot?.slotEnd
                    ? diffMinutes(new Date(currentSlot.slotStart), new Date(currentSlot.slotEnd))
                    : currentSlot?.duration || 0;

                return (
                  <Box
                    key={slot.id}
                    display="grid"
                    gridTemplateColumns="1fr 1fr 120px"
                    gap={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Controller
                      name={`doctorTimeSlots.${idx}.slotStart`}
                      control={control}
                      render={({ field: f }) => (
                        <MobileTimePicker
                          {...f}
                          value={f.value ? new Date(f.value) : null}
                          onChange={(val) => {
                            if (!val) return;
                            f.onChange(val);
                            handleSlotStartChange(idx, val);
                          }}
                          label={`Slot ${idx + 1} start`}
                          slotProps={{ textField: { fullWidth: true } }}
                          // disabled={isReadOnly}
                          disabled
                        />
                      )}
                    />

                    <Controller
                      name={`doctorTimeSlots.${idx}.slotEnd`}
                      control={control}
                      render={({ field: f }) => (
                        <MobileTimePicker
                          {...f}
                          value={f.value ? new Date(f.value) : null}
                          onChange={(val) => {
                            if (!val) return;
                            f.onChange(val);
                            handleSlotEndChange(idx, val);
                          }}
                          label={`Slot ${idx + 1} end`}
                          slotProps={{ textField: { fullWidth: true } }}
                          disabled={isReadOnly}
                        />
                      )}
                    />

                    <Box>
                      <Typography variant="caption" display="block">
                        {duration} min
                      </Typography>
                      {/* show disabled note if slot start is beyond availability */}
                      {currentSlot?.slotStart &&
                        availabilityEnd &&
                        new Date(currentSlot.slotStart).getTime() >=
                          new Date(availabilityEnd).getTime() && (
                          <Typography variant="caption" color="error">
                            Outside availability
                          </Typography>
                        )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        />
      </Box>

      <DialogActions>
        {!!currentEvent?.id && (
          <Tooltip title="Delete Event">
            <IconButton onClick={onDelete} disabled={isReadOnly}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError || isReadOnly}
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

CalendarForm.propTypes = {
  colorOptions: PropTypes.arrayOf(PropTypes.string),
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  currentDoctor: PropTypes.object,
  selectedRange: PropTypes.object,
  refreshDoctorAvailabilities: PropTypes.func.isRequired,
  events: PropTypes.array,
  selectEventId: PropTypes.string,
  openForm: PropTypes.bool,
  isReadOnly: PropTypes.bool,
};

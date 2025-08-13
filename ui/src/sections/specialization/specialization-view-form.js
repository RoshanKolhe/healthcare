/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
  RHFUploadBox,
} from 'src/components/hook-form';
import { Chip, FormControl, FormHelperText, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------+


export default function SpecializationViewForm({ currentSpecialization }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const [departments, setDepartments] = useState([]);
  
  const NewDepartmentSchema = Yup.object().shape({
    specialization: Yup.string().required('Specialization  is required'),
    description: Yup.string(),
    isActive: Yup.boolean(),
  });
  const defaultValues = useMemo(
    () => ({
      specialization: currentSpecialization?.specialization || '',
      description: currentSpecialization?.description || '',
      isActive: currentSpecialization ? (currentSpecialization?.isActive ? '1' : '0') : '1',
    }),
    [currentSpecialization]
  );

  const methods = useForm({
    resolver: yupResolver(NewDepartmentSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const role = watch('role');

  console.log(role);

  useEffect(() => {
    if (currentSpecialization) {
      reset(defaultValues);
    }
  }, [currentSpecialization, defaultValues, reset]);

  useEffect(() => {
    console.log('here12');
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
  }, [isDark]);

  return (
    <FormProvider methods={methods}>
      <Grid xs={12} md={12}>
        <Card sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ p: 3 }}>
            <Grid container spacing={2} xs={12} md={12}>
              <Grid xs={12} md={6}>
                <RHFSelect name="isActive" label="Status" disabled>
                  {COMMON_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="specialization" label="Specialization" disabled/>
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="description" label="Description" disabled/>
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Grid>
    </FormProvider>
  );
}

SpecializationViewForm.propTypes = {
  currentSpecialization: PropTypes.object,
};

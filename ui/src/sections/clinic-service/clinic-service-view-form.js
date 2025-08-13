/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import {  useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from 'src/components/hook-form';
import { MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import 'react-phone-input-2/lib/material.css';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function ClinicServiceViewForm({ currentClinicService }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const NewDepartmentSchema = Yup.object().shape({
    clinicService: Yup.string().required('ClinicService  is required'),
    description: Yup.string(),
    isActive: Yup.boolean(),
  });
  const defaultValues = useMemo(
    () => ({
      clinicService: currentClinicService?.clinicService || '',
      description: currentClinicService?.description || '',
      isActive: currentClinicService ? (currentClinicService?.isActive ? '1' : '0') : '1',
    }),
    [currentClinicService]
  );

  const methods = useForm({
    resolver: yupResolver(NewDepartmentSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const role = watch('role');

  console.log(role);

  useEffect(() => {
    if (currentClinicService) {
      reset(defaultValues);
    }
  }, [currentClinicService, defaultValues, reset]);

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
                <RHFTextField name="clinicService" label="ClinicService" disabled/>
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

ClinicServiceViewForm.propTypes = {
  currentClinicService: PropTypes.object,
};

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

export default function ClinicTypeViewForm({ currentClinicType }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const NewDepartmentSchema = Yup.object().shape({
    clinicType: Yup.string().required('ClinicType  is required'),
    description: Yup.string(),
    isActive: Yup.boolean(),
  });
  const defaultValues = useMemo(
    () => ({
      clinicType: currentClinicType?.clinicType || '',
      description: currentClinicType?.description || '',
      isActive: currentClinicType ? (currentClinicType?.isActive ? '1' : '0') : '1',
    }),
    [currentClinicType]
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
    if (currentClinicType) {
      reset(defaultValues);
    }
  }, [currentClinicType, defaultValues, reset]);

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
                <RHFTextField name="clinicType" label="ClinicType" disabled/>
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

ClinicTypeViewForm.propTypes = {
  currentClinicType: PropTypes.object,
};

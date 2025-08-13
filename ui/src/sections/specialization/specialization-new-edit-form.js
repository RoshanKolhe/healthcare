/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFAutocomplete,
  RHFSelect,
  RHFTextField,
  RHFUploadBox,
} from 'src/components/hook-form';
import { useResponsive } from 'src/hooks/use-responsive';
import { CardHeader, Chip, MenuItem } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import axiosInstance from 'src/utils/axios';
import { COMMON_STATUS_OPTIONS, USER_STATUS_OPTIONS } from 'src/utils/constants';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function SpecializationNewEditForm({ currentSpecialization }) {
  console.log('currentSpecialization 1', currentSpecialization);

  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const preview = useBoolean();
  const rawFilter = {
    where: {
      isActive: true,
    },
  };

  const NewSpecializationSchema = Yup.object().shape({
    specialization: Yup.string().required('Specialization is required'),
    description: Yup.string().required('Description is required'),
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
    resolver: yupResolver(NewSpecializationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        specialization: formData.specialization,
        description: formData.description,
        isActive: currentSpecialization ? formData.isActive : true,
      };
      if (!currentSpecialization) {
        await axiosInstance.post('/specializations', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/specializations/${currentSpecialization.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentSpecialization ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.specialization.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });
  useEffect(() => {
    if (currentSpecialization) {
      reset(defaultValues);
    }
  }, [currentSpecialization, defaultValues, reset]);

  const renderDetails = (
    <Grid xs={12} md={12}>
      <Card sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={2} xs={12} md={12}>
            {/* {currentSpecialization && (
              <Grid xs={12} md={6}>
                <RHFSelect name="isActive" label="Status">
                  {USER_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
            )} */}
            {currentSpecialization ? (
                <Grid xs={12} md={6}>
                  <RHFSelect name="isActive" label="Status">
                    {COMMON_STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
                </Grid>
            ) : null}
            <Grid xs={12} md={6}>
              <RHFTextField name="specialization" label="Specialization" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="description" label="Description" />
            </Grid>
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentSpecialization ? 'Create Specialization' : 'Save Changes'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}
      </Grid>
    </FormProvider>
  );
}

SpecializationNewEditForm.propTypes = {
  currentSpecialization: PropTypes.object,
};

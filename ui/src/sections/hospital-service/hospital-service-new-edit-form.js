/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import { MenuItem } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import axiosInstance from 'src/utils/axios';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function HospitalServiceNewEditForm({ currentHospitalService }) {
  console.log('currentHospitalService 1', currentHospitalService);

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewHospitalServiceSchema = Yup.object().shape({
    hospitalService: Yup.string().required('Hospital Type is required'),
    description: Yup.string().required('Description is required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      hospitalService: currentHospitalService?.hospitalService || '',
      description: currentHospitalService?.description || '',
      isActive: currentHospitalService ? (currentHospitalService?.isActive ? '1' : '0') : '1',
    }),
    [currentHospitalService]
  );

  const methods = useForm({
    resolver: yupResolver(NewHospitalServiceSchema),
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
        hospitalService: formData.hospitalService,
        description: formData.description,
        isActive: currentHospitalService ? formData.isActive : true,
      };
      if (!currentHospitalService) {
        await axiosInstance.post('/hospital-services', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/hospital-services/${currentHospitalService.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentHospitalService ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.hospitalService.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });
  useEffect(() => {
    if (currentHospitalService) {
      reset(defaultValues);
    }
  }, [currentHospitalService, defaultValues, reset]);

  const renderDetails = (
    <Grid xs={12} md={12}>
      <Card sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={2} xs={12} md={12}>
            {currentHospitalService ? (
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
              <RHFTextField name="hospitalService" label="Hospital Service" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="description" label="Description" />
            </Grid>
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentHospitalService ? 'Create Service' : 'Save Changes'}
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

HospitalServiceNewEditForm.propTypes = {
  currentHospitalService: PropTypes.object,
};

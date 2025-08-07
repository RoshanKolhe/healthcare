/* eslint-disable no-useless-escape */
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
import { COMMON_STATUS_OPTIONS, states } from 'src/utils/constants';
import { useGetHospitalsWithFilter } from 'src/api/hospital';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function BranchNewEditForm({ currentBranch }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const preview = useBoolean();
  const rawFilter = {
    where: {
      isActive: true,
    },
  };
  const encodedFilter = `filter=${encodeURIComponent(JSON.stringify(rawFilter))}`;
  const { filteredhospitals: hospitals } = useGetHospitalsWithFilter(encodedFilter);

  const NewBranchSchema = Yup.object().shape({
    name: Yup.string().required('Branch Name is required'),
    fullAddress: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    postalCode: Yup.string().required('Pin code is required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentBranch?.name || '',
      fullAddress: currentBranch?.fullAddress || '',
      city: currentBranch?.city || '',
      state: currentBranch?.state || '',
      country: currentBranch?.country || '',
      postalCode: currentBranch?.postalCode || '',
      isActive: currentBranch ? (currentBranch?.isActive ? '1' : '0') : '1',
      hospital: currentBranch?.hospital || null,
    }),
    [currentBranch]
  );

  const methods = useForm({
    resolver: yupResolver(NewBranchSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        name: formData.name,
        fullAddress: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        isActive: currentBranch ? formData.isActive : true,
        hospitalId: formData.hospital?.id,
      };
      if (!currentBranch) {
        await axiosInstance.post('/branches', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/branches/${currentBranch.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentBranch ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.branch.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    const fetchAddressDetails = async (postalCode) => {
      try {
        const response = await axiosInstance.get(`/location-by-pincode/${postalCode}`);

        const { city, state, stateCode, country } = response.data;
        setValue('city', city || '');
        setValue('state', state || '');
        setValue('country', country || '');
      } catch (error) {
        console.error('Error fetching address details:', error);
      }
    };

    const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    if (values.postalCode && postalCodeRegex.test(values.postalCode)) {
      fetchAddressDetails(values.postalCode);
    }
  }, [values.postalCode, setValue]);

  useEffect(() => {
    if (currentBranch) {
      reset(defaultValues);
    }
  }, [currentBranch, defaultValues, reset]);

  const renderDetails = (
    <Grid xs={12} md={12}>
      <Card sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={2} xs={12} md={12}>
            <Grid xs={12} md={6}>
              <RHFTextField name="name" label="Branch Name" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="fullAddress" label="Full Address" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="postalCode" label="Postal Code" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="country" label="Country" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="state" label="State" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="city" label="City" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFAutocomplete
                name="hospital"
                label="Hospital"
                options={hospitals || []}
                getOptionLabel={(option) => `${option?.hospitalName}` || ''}
                filterOptions={(x) => x}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {option?.hospitalName}
                    </Typography>
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, tagIndex) => (
                    <Chip
                      {...getTagProps({ index: tagIndex })}
                      key={option.id}
                      label={option.hospitalName}
                      size="small"
                      color="info"
                      variant="soft"
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentBranch ? 'Create User' : 'Save Changes'}
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

BranchNewEditForm.propTypes = {
  currentBranch: PropTypes.object,
};

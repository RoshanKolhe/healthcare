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
import { useGetCategorysWithFilter } from 'src/api/categorys';
import { useGetHospitalServicesWithFilter } from 'src/api/hospital-service';
import { useGetHospitalTypesWithFilter } from 'src/api/hospital-type';

// ----------------------------------------------------------------------

export default function HospitalNewEditForm({ currentHospital, isEditForm }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const filter = {
    where: {
      isActive: true,
    },
  };
  const fillterString = encodeURIComponent(JSON.stringify(filter));

  const { filteredCategorys: categorys } = useGetCategorysWithFilter(fillterString);
  const { filteredHospitalServices: hospitalServices } =
    useGetHospitalServicesWithFilter(fillterString);
  const { filteredHospitalTypes: hospitalTypes } = useGetHospitalTypesWithFilter(fillterString);

  const { enqueueSnackbar } = useSnackbar();

  const preview = useBoolean();

  const NewHospitalSchema = Yup.object().shape({
    isEditForm: Yup.boolean(),
    hospitalName: Yup.string().required('Hospital Name is required'),
    hospitalRegNum: Yup.string().required('Hospital Register Number is required'),
    category: Yup.object().required('Hospital Category is required'),
    hospitalType: Yup.object().required('Hospital Services is required'),
    hospitalService: Yup.object().required('Hospital Type is required'),
    description: Yup.string().required('Description is required'),
    imageUpload: Yup.object().shape({
      fileUrl: Yup.string().required('Image is required'),
    }),
    fullAddress: Yup.string().when('isEditForm', {
      is: false,
      then: (schema) => schema.required('Address is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    city: Yup.string().when('isEditForm', {
      is: false,
      then: (schema) => schema.required('City is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    state: Yup.string().when('isEditForm', {
      is: false,
      then: (schema) => schema.required('State is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    country: Yup.string().when('isEditForm', {
      is: false,
      then: (schema) => schema.required('Country is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    postalCode: Yup.string().when('isEditForm', {
      is: false,
      then: (schema) => schema.required('Pin code is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      isEditForm: isEditForm || false,
      hospitalName: currentHospital?.hospitalName || '',
      hospitalRegNum: currentHospital?.hospitalRegNum || '',
      category: currentHospital?.category || null,
      hospitalType: currentHospital?.hospitalType || null,
      hospitalService: currentHospital?.hospitalService || null,
      description: currentHospital?.description || '',
      imageUpload: currentHospital?.imageUpload
        ? {
            fileUrl: currentHospital.imageUpload.fileUrl,
            preview: currentHospital.imageUpload.fileUrl,
          }
        : '',
      fullAddress: currentHospital?.fullAddress || '',
      city: currentHospital?.city || '',
      state: currentHospital?.state || '',
      country: currentHospital?.country || '',
      postalCode: currentHospital?.postalCode || '',
      status: currentHospital?.status || '',
      isVerified: currentHospital?.isVerified || true,
      isActive: currentHospital ? (currentHospital?.isActive ? '1' : '0') : '1',
    }),
    [currentHospital, isEditForm]
  );

  const methods = useForm({
    resolver: yupResolver(NewHospitalSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  console.log('errors', errors);
  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    console.log('Submitting data:', formData);
    try {
      const hospitalPayload = {
        hospitalName: formData.hospitalName,
        hospitalRegNum: formData.hospitalRegNum,
        categoryId: formData.category?.id,
        hospitalServiceId: formData.hospitalService?.id,
        hospitalTypeId: formData.hospitalType?.id,
        description: formData.description,
        country: formData.country,
        isActive: currentHospital ? formData.isActive : true,
        imageUpload: {
          fileUrl: formData.imageUpload?.fileUrl,
        },
      };

      const branchPayload = {
        city: formData.city,
        state: formData.state,
        fullAddress: formData.fullAddress,
        country: formData.country,
        postalCode: Number(formData.postalCode),
      };
      if (!currentHospital) {
        await axiosInstance.post('/hospitals', {
          hospital: hospitalPayload,
          branch: branchPayload,
        });
      } else {
        await axiosInstance.patch(`/hospitals/${currentHospital.id}`, hospitalPayload);
      }
      reset();
      enqueueSnackbar(currentHospital ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.hospital.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleRemoveFile = useCallback(() => {
    setValue('imageUpload', null);
  }, [setValue]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const formData = new FormData();
        formData.append('imageUpload', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        const fileUrl = data?.files?.[0]?.fileUrl;
        setValue(
          'imageUpload',
          {
            fileUrl, // for backend submission
            preview: fileUrl, // ✅ use backend URL for UI preview
          },
          { shouldValidate: true }
        );
      }
    },
    [setValue]
  );
  
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
    if (currentHospital) {
      reset(defaultValues);
    }
  }, [currentHospital, defaultValues, reset]);

  const renderDetails = (
    <Grid xs={12} md={12}>
      <Card sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={2} xs={12} md={12}>
            <Grid xs={12} md={6}>
              <RHFTextField name="hospitalName" label="Name" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="hospitalRegNum" label="Register Number" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFAutocomplete
                name="category"
                label="Category"
                options={categorys}
                getOptionLabel={(option) => option?.category || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFAutocomplete
                name="hospitalType"
                label="Type"
                options={hospitalTypes}
                getOptionLabel={(option) => option?.hospitalType || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFAutocomplete
                name="hospitalService"
                label="Services"
                options={hospitalServices}
                getOptionLabel={(option) => option?.hospitalService || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Hospital Profile</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <RHFUploadBox
                      name="imageUpload"
                      maxSize={3145728}
                      onDrop={handleDrop}
                      onDelete={handleRemoveFile}
                    />
                  </Box>
                  {values.imageUpload?.preview && (
                    <Box>
                      <a
                        href={values.imageUpload.preview}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Box
                          component="img"
                          src={values.imageUpload.preview}
                          alt="preview"
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: 2,
                            objectFit: 'cover',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                          }}
                        />
                      </a>
                    </Box>
                  )}
                </Box>
              </Stack>
            </Grid>
            <Grid xs={12} md={12}>
              <RHFTextField name="description" label="Description" multiline rows={3} />
            </Grid>
            {!currentHospital ? (
              <>
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
                  <RHFTextField name="fullAddress" label="Address" />
                </Grid>
              </>
            ) : null}
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentHospital ? 'Create User' : 'Save Changes'}
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

HospitalNewEditForm.propTypes = {
  currentHospital: PropTypes.object,
  isEditForm: PropTypes.bool,
};

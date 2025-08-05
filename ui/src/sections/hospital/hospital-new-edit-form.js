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
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import Label from 'src/components/label';
import { useGetCategorys } from 'src/api/categorys';
import { useGetHospitalServices } from 'src/api/hospital-service';
import { useGetHospitalTypes } from 'src/api/hospital-type';

// ----------------------------------------------------------------------

export default function HospitalNewEditForm({ currentHospital }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { categorys } = useGetCategorys();
  const { hospitalServices } = useGetHospitalServices();
  const { hospitalTypes } = useGetHospitalTypes();

  const { enqueueSnackbar } = useSnackbar();

  const preview = useBoolean();

  const NewHospitalSchema = Yup.object().shape({
    hospitalName: Yup.string().required('Hospital Name is required'),
    hospitalRegNum: Yup.number().required('Hospital Register Number is required'),
    category: Yup.object().required('Hospital Category is required'),
    hospitalType: Yup.object().required('Hospital Services is required'),
    hospitalService: Yup.object().required('Hospital Type is required'),
    description: Yup.string().required('Description is required'),
    imageUpload: Yup.object().shape({
      fileUrl: Yup.string().required('Image is required'),
    }),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    postalCode: Yup.string().required('Pin code is required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
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
      address: currentHospital?.address || '',
      city: currentHospital?.city || '',
      state: currentHospital?.state || '',
      country: currentHospital?.country || '',
      postalCode: currentHospital?.postalCode || '',
      status: currentHospital?.status || '',
      isVerified: currentHospital?.isVerified || true,
      isActive: currentHospital ? (currentHospital?.isActive ? '1' : '0') : '1',
    }),
    [currentHospital]
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
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        hospitalName: formData.hospitalName,
        hospitalRegNum: Number(formData.hospitalRegNum),
        categoryId: formData.category?.id,
        hospitalServiceId: formData.hospitalService?.id,
        hospitalTypeId: formData.hospitalType?.id,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: Number(formData.postalCode),
        isActive: currentHospital ? formData.isActive : true,
        imageUpload: {
          fileUrl: formData.imageUpload?.fileUrl,
        },
      };
      if (!currentHospital) {
        await axiosInstance.post('/hospitals', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/hospitals/${currentHospital.id}`, inputData);
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

            <Grid xs={12} md={6}>
              <RHFTextField name="address" label="Address" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="city" label="City" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="state" label="State" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="country" label="Country" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="postalCode" label="Postal Code" />
            </Grid>
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
};

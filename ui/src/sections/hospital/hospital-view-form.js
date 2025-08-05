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
import { FormControl, FormHelperText, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import { useGetCategorys } from 'src/api/categorys';
import { useGetHospitalServices } from 'src/api/hospital-service';
import { useGetHospitalTypes } from 'src/api/hospital-type';

// ----------------------------------------------------------------------

export default function HospitalViewForm({ currentHospital }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const { categorys } = useGetCategorys();
  const { hospitalServices } = useGetHospitalServices();
  const { hospitalTypes } = useGetHospitalTypes();

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const [departments, setDepartments] = useState([]);

  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      hospitalName: Yup.string().required('Hospital Name is required'),
      hospitalRegNum: Yup.number().required('Hospital Register Number is required'),
      category: Yup.string().required('Hospital Category is required'),
      hospitalType: Yup.string().required('Hospital Services is required'),
      hospitalService: Yup.string().required('Hospital Type is required'),
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
      isVerified: Yup.boolean(),
    })
  );
  const defaultValues = useMemo(
    () => ({
      hospitalName: currentHospital?.hospitalName || '',
      hospitalRegNum: currentHospital?.hospitalRegNum || '',
      category: currentHospital?.category || null,
      hospitalType: currentHospital?.hospitalType || null,
      hospitalService: currentHospital?.hospitalService || null,
      description: currentHospital?.description || '',
      // imageUpload: currentHospital?.imageUpload || '',
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
      isActive: currentHospital ? (currentHospital?.isActive ? '1' : '0') : '1',
      isVerified: currentHospital?.isVerified || true,
    }),
    [currentHospital]
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
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

  const branch = watch('branch');
  const selectedDepartments = watch('departments');
  const values = watch();
  const role = watch('role');

  console.log(role);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        console.log(data);
        setValue('avatarUrl', data?.files[0].fileUrl, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );
  const handleRemoveFile = useCallback(() => {
    setValue('imageUpload', null);
  }, [setValue]);

  useEffect(() => {
    if (currentHospital) {
      reset(defaultValues);
    }
  }, [currentHospital, defaultValues, reset]);

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
                <RHFTextField name="hospitalName" label="Name" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="hospitalRegNum" label="Register Number" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete
                  name="category"
                  label="Category"
                  options={categorys}
                  getOptionLabel={(option) => option?.category || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  disabled
                />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete
                  name="hospitalType"
                  label="Type"
                  options={hospitalTypes}
                  getOptionLabel={(option) => option?.hospitalType || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  disabled
                />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete
                  name="hospitalService"
                  label="Services"
                  options={hospitalServices}
                  getOptionLabel={(option) => option?.hospitalService || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  disabled
                />
              </Grid>
              <Grid xs={12} md={12}>
                <RHFTextField name="description" label="Description" multiline rows={3} disabled />
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
                        disabled
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
              <Grid xs={12} md={6}>
                <RHFTextField name="address" label="Address" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="city" label="City" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="state" label="State" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="country" label="Country" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="postalCode" label="Postal Code" disabled />
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Grid>
    </FormProvider>
  );
}

HospitalViewForm.propTypes = {
  currentHospital: PropTypes.object,
};

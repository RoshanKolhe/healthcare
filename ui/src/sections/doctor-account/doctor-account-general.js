import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// hooks
// utils
import { fData } from 'src/utils/format-number';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar, RHFSelect } from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { MenuItem } from '@mui/material';
import { states } from 'src/utils/constants';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function DoctorAccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const [doctor, setDoctor] = useState();
  // const { doctor } = useAuthContext();
  const role = doctor?.permissions?.[0];
  console.log('DoctorAccountGeneral', doctor);

  const UpdateDoctorSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    role: Yup.string().required('Role is required'),
    isActive: Yup.boolean(),
    dob: Yup.string(),
    fullAddress: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: doctor?.firstName || '',
      lastName: doctor?.lastName || '',
      role: doctor?.permissions[0] || '',
      dob: doctor?.dob || '',
      email: doctor?.email || '',
      isActive: doctor?.isActive || true,
      avatarUrl: doctor?.avatar?.fileUrl || null,
      phoneNumber: doctor?.phoneNumber || '',
      fullAddress: doctor?.fullAddress || '',
      city: doctor?.city || '',
      state: doctor?.state || '',
      postalCode: doctor?.postalCode || '',
    }),
    [doctor]
  );

  const methods = useForm({
    resolver: yupResolver(UpdateDoctorSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        isActive: formData.isActive,
        dob: formData.dob,
        fullAddress: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
      };
      if (formData.avatarUrl) {
        inputData.avatar = {
          fileUrl: formData.avatarUrl,
        };
      }
      await axiosInstance.patch(`/doctors/${doctor.id}`, inputData);
      enqueueSnackbar(doctor ? 'Update success!' : 'Create success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      console.log(file);
      // const newFile = Object.assign(file, {
      //   preview: URL.createObjectURL(file),
      // });

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

  const getCurrentDoctor = async () => {
    try {
      const response = await axiosInstance.get(endpoints.auth.doctor.me);

      const doctorData = response.data;
      setDoctor(doctorData);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    if (doctor) {
      console.log(defaultValues);
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, reset]);

  useEffect(() => {
    getCurrentDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="avatarUrl"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              <RHFTextField name="email" label="Email Address" disabled />
              <RHFSelect fullWidth name="role" label="Role" disabled>
                {[
                  { value: 'super_admin', name: 'Super Admin' },
                  { value: 'clinic', name: 'Clinic' },
                  { value: 'doctor', name: 'Doctor' },
                  { value: 'branch', name: 'Branch' },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <Controller
                name="dob"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="DOB"
                    value={new Date(field.value)}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
              <RHFTextField name="fullAddress" label="Full Address" />
              <RHFTextField name="state" label="State/Region" />
              <RHFTextField name="city" label="City" />
              <RHFTextField name="postalCode" label="Postal Code" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                style={{
                  backgroundColor: '#00554E',
                  width: '250px',
                  height: '40px',
                  marginTop: '20px',
                }}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

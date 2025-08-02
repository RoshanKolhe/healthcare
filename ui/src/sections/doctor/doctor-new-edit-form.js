/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
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
import { useTheme } from '@mui/material/styles';
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
} from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import { FormControl, FormHelperText, IconButton, InputAdornment, MenuItem } from '@mui/material';
import { useGetHospitalsWithFilter } from 'src/api/hospital';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { DatePicker } from '@mui/x-date-pickers';
import { useGetSpecializations } from 'src/api/specializations';

// ----------------------------------------------------------------------

const allRoles = [{ value: 'doctor', name: 'Doctor' }];

export default function DoctorNewEditForm({ currentDoctor }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [validationSchema, setValidationSchema] = useState(() => Yup.object().shape({}));

  const password = useBoolean();
  const rawFilter = {
    where: {
      isActive: true,
    },
    include: [{ relation: 'branches', scope: { where: { isActive: true } } }],
  };

  const encodedFilter = `filter=${encodeURIComponent(JSON.stringify(rawFilter))}`;
  const { filteredhospitals: hospitals } = useGetHospitalsWithFilter(encodedFilter);

  const { specializations } = useGetSpecializations();

  const { doctor } = useAuthContext();
  const doctorRole = doctor?.permissions?.[0];
  const roleOptions =
    // doctorRole === 'hospital' ? allRoles.filter((r) => r.value === 'Hospital') : allRoles;
    doctorRole === 'doctor' ? allRoles.filter((r) => r.value === 'Doctor') : allRoles;

  const defaultValues = useMemo(
    () => ({
      firstName: currentDoctor?.firstName || '',
      lastName: currentDoctor?.lastName || '',
      dob: currentDoctor?.dob || '',
      fullAddress: currentDoctor?.fullAddress || '',
      city: currentDoctor?.city || '',
      state: currentDoctor?.state || '',
      email: currentDoctor?.email || '',
      password: '',
      confirmPassword: '',
      phoneNumber: currentDoctor?.phoneNumber || '',
      hospital: currentDoctor?.hospital || null,
      branch: currentDoctor?.branch || null,
      specialization: currentDoctor?.specialization || null,
      // role: currentDoctor?.permissions[0] || '',
      role: 'doctor',
      isVerified: currentDoctor?.isVerified || true,
      isActive: currentDoctor?.isActive ?? 1,
      avatar: currentDoctor?.avatar
        ? {
            fileUrl: currentDoctor.avatar.fileUrl,
            preview: currentDoctor.avatar.fileUrl,
          }
        : '',
    }),
    [currentDoctor]
  );

  // const mergedSchema = NewDoctorSchema.concat(validationSchema);
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const values = watch();
  const role = watch('role');

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        fullAddress: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        permissions: [formData.role],
        isActive: currentDoctor ? formData.isActive : true,
        specializationId: formData.specialization?.id,
        hospitalId: formData.hospital?.id,
        branchId: formData.branch?.id,
        avatar: {
          fileUrl: formData.avatar?.fileUrl,
        },
      };
      if (!currentDoctor) {
        await axiosInstance.post('/doctors-register', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/doctors/${currentDoctor.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentDoctor ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.doctor.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleRemoveFile = useCallback(() => {
    setValue('avatar', null);
  }, [setValue]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        const fileUrl = data?.files?.[0]?.fileUrl;
        setValue(
          'avatar',
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
    if (role === 'doctor') {
      setValidationSchema((prev) =>
        prev.concat(
          Yup.object().shape({
            hospital: Yup.object().required('Hospital is required'),
            branch: Yup.object().required('Branch is required'),
          })
        )
      );
    } else {
      // Default case: super_admin or any undefined role
      setValidationSchema((prev) =>
        prev.concat(
          Yup.object().shape({
            hospital: Yup.mixed().notRequired(),
            branch: Yup.mixed().notRequired(),
          })
        )
      );
    }
  }, [currentDoctor, role]);

  useEffect(() => {
    const baseSchema = {
      firstName: Yup.string().required('First Name is required'),
      lastName: Yup.string().required('Last Name is required'),
      dob: Yup.string(),
      fullAddress: Yup.string().required('Address is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      email: Yup.string()
        .required('Email is required')
        .email('Email must be a valid email address'),
      password: Yup.string().required('Password is required'),
      role: Yup.string().required('Role is required'),
      specialization: Yup.object().required('Specialization is required'),
      phoneNumber: Yup.string()
        .required('Phone number is required')
        .matches(/^[0-9]{8,15}$/, 'Phone number must be between 8 and 15 digits'),
      avatar: Yup.object().shape({
        fileUrl: Yup.string().required('Image is required'),
      }),
      // not required
      status: Yup.string(),
      isVerified: Yup.boolean(),
    };
    if (!currentDoctor) {
      baseSchema.password = Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required');

      baseSchema.confirmPassword = Yup.string()
        .required('Confirm password is required')
        .oneOf([Yup.ref('password')], 'Passwords must match');
    } else {
      baseSchema.password = Yup.string().notRequired();
      baseSchema.confirmPassword = Yup.string().notRequired();
    }
  }, [currentDoctor, role]);

  useEffect(() => {
    if (selectedHospital && selectedHospital.branches) {
      setBranchOptions(selectedHospital.branches);
      setValue('branch', null); // Optional: Reset branch when hospital changes
    } else {
      setBranchOptions([]);
      setValue('branch', null);
    }
  }, [selectedHospital, setValue]);

  useEffect(() => {
    if (role === 'hospital') {
      setValue('branch', null);
    }
  }, [role, setValue]);

  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
  }, [isDark]);

  useEffect(() => {
    if (currentDoctor) {
      reset(defaultValues);
    }
  }, [currentDoctor, defaultValues, reset]);
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentDoctor && (
              <Label
                color={(values.isActive && 'success') || (!values.isActive && 'error') || 'warning'}
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.isActive ? 'Active' : 'In-Active'}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatar"
                maxSize={3145728}
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
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
            </Box>
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
              <RHFTextField name="email" label="Email Address" />
              {/* {!currentDoctor ? (
                <RHFTextField
                  name="password"
                  label="Password"
                  type={password.value ? 'text' : 'password'}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={password.onToggle} edge="end">
                          <Iconify
                            icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ) : null} */}
              {!currentDoctor ? (
                <>
                  <RHFTextField
                    name="password"
                    label="Password"
                    type={password.value ? 'text' : 'password'}
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={password.onToggle} edge="end">
                            <Iconify
                              icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <RHFTextField
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={password.value ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={password.onToggle} edge="end">
                            <Iconify
                              icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              ) : null}
              <Controller
                name="phoneNumber"
                control={control}
                defaultValue=""
                rules={{ required: 'Phone number is required' }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <PhoneInput
                      {...field}
                      value={field.value}
                      country="ae"
                      enableSearch
                      specialLabel={
                        <span
                          style={{
                            backgroundColor: 'transparent',
                            color: error
                              ? '#f44336'
                              : isDark
                              ? '#fff'
                              : theme.palette.text.secondary,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Phone Number
                        </span>
                      }
                      inputStyle={{
                        width: '100%',
                        height: '56px',
                        fontSize: '16px',
                        backgroundColor: 'transparent',
                        borderColor: error ? '#f44336' : '#c4c4c4',
                        borderRadius: '8px',
                        color: isDark ? '#fff' : undefined,
                        paddingLeft: '48px',
                        paddingRight: '40px',
                      }}
                      containerStyle={{ width: '100%' }}
                      onChange={(value) => field.onChange(value)}
                      inputProps={{
                        name: field.name,
                        required: true,
                      }}
                    />

                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
              <RHFTextField name="fullAddress" label="Full Address" />
              <RHFTextField name="city" label="City" />
              <RHFTextField name="state" label="State" />
              <RHFAutocomplete
                name="specialization"
                label="Specialization"
                options={specializations}
                getOptionLabel={(option) => option?.specialization || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
              {/* <RHFSelect fullWidth name="role" label="Role">
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect> */}

              {values.role === 'doctor' && (
                <>
                  <RHFAutocomplete
                    name="hospital"
                    label="Hospital"
                    options={hospitals}
                    getOptionLabel={(option) => option?.hospitalName || ''}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    onChange={(_, value) => {
                      setValue('hospital', value);
                      setSelectedHospital(value);
                      // Extract branches from selected hospital
                      setBranchOptions(value?.branches || []);
                    }}
                  />

                  <RHFAutocomplete
                    name="branch"
                    label="Branch"
                    options={branchOptions}
                    getOptionLabel={(option) => option?.name || ''}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  />
                </>
              )}
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentDoctor ? 'Create Doctor' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

DoctorNewEditForm.propTypes = {
  currentDoctor: PropTypes.object,
};

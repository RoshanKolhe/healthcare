/* eslint-disable no-lonely-if */
/* eslint-disable no-useless-escape */
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
import { useGetClinicsWithFilter } from 'src/api/clinic';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { DatePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

const allRoles = [
  { value: 'super_admin', name: 'Super Admin' },
  { value: 'clinic', name: 'Clinic' },
  { value: 'branch', name: 'Branch' },
];

export default function UserNewEditForm({ currentUser }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [validationSchema, setValidationSchema] = useState(() => Yup.object().shape({}));

  const password = useBoolean();
  const rawFilter = {
    where: {
      isActive: true,
    },
    include: [{ relation: 'branches', scope: { where: { isActive: true } } }],
  };

  const encodedFilter = `filter=${encodeURIComponent(JSON.stringify(rawFilter))}`;
  const { filteredclinics: clinics } = useGetClinicsWithFilter(encodedFilter);

  const { user } = useAuthContext();
  const userRole = user?.permissions?.[0];
  const roleOptions =
    // userRole === 'clinic' ? allRoles.filter((r) => r.value === 'Clinic') : allRoles;
    userRole === 'clinic' || userRole === 'branch'
      ? allRoles.filter((r) => r.value === 'Clinic' || r.value === 'Branch')
      : allRoles;

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      dob: currentUser?.dob || '',
      fullAddress: currentUser?.fullAddress || '',
      city: currentUser?.city || '',
      state: currentUser?.state || '',
      country: currentUser?.country || '',
      postalCode: currentUser?.postalCode || '',
      email: currentUser?.email || '',
      password: '',
      confirmPassword: '',
      phoneNumber: currentUser?.phoneNumber || '',
      clinic: currentUser?.clinic || null,
      branch: currentUser?.branch || null,
      role: currentUser?.permissions[0] || '',
      isVerified: currentUser?.isVerified || true,
      isActive: currentUser?.isActive ?? 1,
      avatar: currentUser?.avatar
        ? {
            fileUrl: currentUser.avatar.fileUrl,
            preview: currentUser.avatar.fileUrl,
          }
        : '',
    }),
    [currentUser]
  );

  // const mergedSchema = NewUserSchema.concat(validationSchema);
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
        country: formData.country,
        postalCode: formData.postalCode,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        permissions: [formData.role],
        isActive: currentUser ? formData.isActive : true,
        clinicId: formData.clinic?.id,
        branchId: formData.branch?.id,
        avatar: {
          fileUrl: formData.avatar?.fileUrl,
        },
      };
      if (!currentUser) {
        await axiosInstance.post('/register', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/users/${currentUser.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
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
    if (role === 'clinic') {
      setValidationSchema((prev) =>
        prev.concat(
          Yup.object().shape({
            clinic: Yup.object().required('Clinic is required'),
            branch: Yup.mixed().notRequired(),
          })
        )
      );
    } else if (role === 'branch') {
      setValidationSchema((prev) =>
        prev.concat(
          Yup.object().shape({
            clinic: Yup.object().required('Clinic is required'),
            branch: Yup.object().required('Branch is required'),
          })
        )
      );
    } else {
      // Default case: super_admin or any undefined role
      setValidationSchema((prev) =>
        prev.concat(
          Yup.object().shape({
            clinic: Yup.mixed().notRequired(),
            branch: Yup.mixed().notRequired(),
          })
        )
      );
    }
  }, [currentUser, role]);

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
      postalCode: Yup.string().required('Pin code is required'),
      country: Yup.string().required('Country is required'),
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

    // 👇 Add password rules only if creating a new user
    if (!currentUser) {
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

    setValidationSchema(Yup.object().shape(baseSchema));
  }, [currentUser]);

  useEffect(() => {
  if (selectedClinic && selectedClinic.branches) {
    setBranchOptions(selectedClinic.branches);
    if (!currentUser) {
      setValue('branch', null);
    } else {
      if (selectedClinic.id !== currentUser.clinicId) {
        setValue('branch', null);
      }
    }
  } else {
    setBranchOptions([]);
    setValue('branch', null);
  }
}, [selectedClinic, setValue, currentUser]);

  useEffect(() => {
    if (currentUser?.clinic && Array.isArray(clinics) && clinics.length > 0) {
      const clinicId = currentUser.clinic?.id ?? currentUser.clinic;
      const clinicObj = clinics.find((c) => c.id === clinicId);

      if (clinicObj) {
        setSelectedClinic(clinicObj);
        setValue('clinic', clinicObj, { shouldValidate: false, shouldDirty: false });

        setBranchOptions(clinicObj.branches || []);

        if (currentUser.branch && clinicObj.branches?.length) {
          const branchId = currentUser.branch?.id ?? currentUser.branch;
          const branchObj = clinicObj.branches.find((b) => b.id === branchId);
          if (branchObj) {
            setValue('branch', branchObj, { shouldValidate: false, shouldDirty: false });
          }
        }
      }
    }
  }, [currentUser, clinics, setValue]);

  // useEffect(() => {
  //   if (selectedClinic && selectedClinic.branches) {
  //     setBranchOptions(selectedClinic.branches);
  //     setValue('branch', null); // Optional: Reset branch when clinic changes
  //   } else {
  //     setBranchOptions([]);
  //     setValue('branch', null);
  //   }
  // }, [selectedClinic, setValue]);

  useEffect(() => {
    if (role === 'clinic') {
      setValue('branch', null);
    }
  }, [role, setValue]);

  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
  }, [isDark]);

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
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
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
              {!currentUser ? (
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
              <RHFTextField name="postalCode" label="Postal Code" />
              <RHFTextField name="country" label="Country" />
              <RHFTextField name="state" label="State" />
              <RHFTextField name="city" label="City" />
              <RHFTextField name="fullAddress" label="Full Address" />
              <RHFSelect fullWidth name="role" label="Role">
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              {values.role === 'clinic' && (
                <RHFAutocomplete
                  name="clinic"
                  label="Clinic"
                  options={clinics}
                  getOptionLabel={(option) => option?.clinicName || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(_, value) => {
                    setValue('clinic', value);
                    setSelectedClinic(value);
                  }}
                />
              )}

              {values.role === 'branch' && (
                <>
                  <RHFAutocomplete
                    name="clinic"
                    label="Clinic"
                    options={clinics}
                    getOptionLabel={(option) => option?.clinicName || ''}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    onChange={(_, value) => {
                      setValue('clinic', value);
                      setSelectedClinic(value);
                      // Extract branches from selected clinic
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
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};

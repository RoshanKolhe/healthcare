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
import { Chip, FormControl, FormHelperText, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import { useGetClinicsWithFilter } from 'src/api/clinic';

// ----------------------------------------------------------------------

export default function BranchViewForm({ currentBranch }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const [departments, setDepartments] = useState([]);
  const rawFilter = {
    where: {
      isActive: true,
    },
  };
  const encodedFilter = `filter=${encodeURIComponent(JSON.stringify(rawFilter))}`;
  const { filteredclinics: clinics } = useGetClinicsWithFilter(encodedFilter);

  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      name: Yup.string().required('Branch Name is required'),
      fullAddress: Yup.string().required('Address is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      country: Yup.string().required('Country is required'),
      postalCode: Yup.string().required('Pin code is required'),
      isActive: Yup.boolean(),
    })
  );
  const defaultValues = useMemo(
    () => ({
      name: currentBranch?.name || '',
      fullAddress: currentBranch?.fullAddress || '',
      city: currentBranch?.city || '',
      state: currentBranch?.state || '',
      country: currentBranch?.country || '',
      postalCode: currentBranch?.postalCode || '',
      isActive: currentBranch ? (currentBranch?.isActive ? '1' : '0') : '1',
      clinic: currentBranch?.clinic || null,
    }),
    [currentBranch]
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
    if (role && role !== 'admin' && role !== 'super_admin') {
      setValidationSchema((prev) =>
        prev.concat(
          Yup.object().shape({
            branch: Yup.object().required('Branch is required'),
            departments: Yup.array()
              .min(1, 'At least one department must be selected')
              .required('Departments are required'),
          })
        )
      );
    } else {
      setValidationSchema((prev) =>
        prev.concat(
          Yup.object().shape({
            branch: Yup.mixed().notRequired(),
            departments: Yup.array().notRequired(),
          })
        )
      );
    }
  }, [role]);

  useEffect(() => {
    if (!branch) {
      setDepartments([]);
      setValue('departments', []);
      return;
    }

    const fetchedDepartments = branch?.departments || [];

    setDepartments(fetchedDepartments);

    if (!currentBranch) {
      setValue('departments', []);
    }
  }, [branch, currentBranch, setValue]);

  useEffect(() => {
    if (role === 'admin') {
      setValue('branch', null);
      setValue('departments', []);
    }
  }, [role, setValue]);

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
                <RHFTextField name="name" label="Branch Name" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="fullAddress" label="Full Address" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="postalCode" label="Postal Code" disabled/>
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="country" label="Country" disabled/>
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="state" label="State" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="city" label="City" disabled />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete
                  name="clinic"
                  label="Clinic"
                  options={clinics || []}
                  getOptionLabel={(option) => `${option?.clinicName}` || ''}
                  filterOptions={(x) => x}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {option?.clinicName}
                      </Typography>
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, tagIndex) => (
                      <Chip
                        {...getTagProps({ index: tagIndex })}
                        key={option.id}
                        label={option.clinicName}
                        size="small"
                        color="info"
                        variant="soft"
                      />
                    ))
                  }
                  disabled
                />
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Grid>
    </FormProvider>
  );
}

BranchViewForm.propTypes = {
  currentBranch: PropTypes.object,
};

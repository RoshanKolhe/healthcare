/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/utils/constants';
// assets
import { countries } from 'src/assets/data';
import { useTheme } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { FormControl, FormHelperText } from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { paths } from 'src/routes/paths';
import axiosInstance from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ currentUser, open, onClose, refreshUsers }) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{8,15}$/, 'Phone number must be between 8 and 15 digits'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      isActive: currentUser?.isActive ? '1' : '0' || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        isActive: formData.isActive,
      };
      await axiosInstance.patch(`/api/users/${currentUser.id}`, inputData);
      refreshUsers();
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
  }, [isDark]);

  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          {!currentUser?.isActive && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Account is In-Active
            </Alert>
          )}
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="isActive" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="firstName" label="First Name" />
            <RHFTextField name="lastName" label="Last Name" />
            <RHFTextField name="email" label="Email Address" />
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
                          color: error ? '#f44336' : isDark ? '#fff' : theme.palette.text.secondary,
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
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

UserQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshUsers: PropTypes.func,
};

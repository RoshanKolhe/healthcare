import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
// import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';
import { USER_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function SpecializationQuickEditForm({
  currentSpecialization,
  open,
  onClose,
  refreshSpecializations,
}) {
  console.log('currentSpecialization',currentSpecialization);
  console.log('currentSpecialization',open);

  const { enqueueSnackbar } = useSnackbar();

  const NewSpecializationSchema = Yup.object().shape({
    specialization: Yup.string().required('Specialization is required'),
    description: Yup.string().required('Description is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
  () => ({
    specialization: currentSpecialization?.specialization || '',
    description: currentSpecialization?.description || '',
    isActive: currentSpecialization?.isActive ? '1' : '0' || '',
  }),
  [currentSpecialization]
);


  const methods = useForm({
    resolver: yupResolver(NewSpecializationSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

    const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        specialization: formData.specialization,
        description: formData.description,
        isActive: formData.isActive,
      };
      await axiosInstance.patch(`/specializations/${currentSpecialization.id}`, inputData);
      refreshSpecializations();
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', formData);
    } catch (error) {
      console.error(error);
    }
  });

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
          {!currentSpecialization?.isActive && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Account is In-Active
            </Alert>
          )}

          <Box
            mt={2}
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

            <RHFTextField name="specialization" label="Specialization" />
            <RHFTextField name="description" label="Description" />          
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

SpecializationQuickEditForm.propTypes = {
  currentSpecialization: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshSpecializations: PropTypes.func,
};

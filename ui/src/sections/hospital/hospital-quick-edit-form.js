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

export default function HospitalQuickEditForm({
  currentHospital,
  open,
  onClose,
  refreshHospitals,
}) {
  console.log('currentHospital',currentHospital);
  console.log('currentHospital',open);

  const { enqueueSnackbar } = useSnackbar();

  const NewHospitalSchema = Yup.object().shape({
    hospitalName: Yup.string().required('Hospital Name is required'),
    hospitalRegNum: Yup.number().required('Hospital Register Number is required'),
    hospitalCategory: Yup.string().required('Hospital Category is required'),
    hospitalType: Yup.string().required('Hospital Type is required'),
    hospitalServices: Yup.string().required('Hospital Services is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
  () => ({
    hospitalName: currentHospital?.hospitalName || '',
    hospitalRegNum: currentHospital?.hospitalRegNum || '',
    hospitalCategory: currentHospital?.hospitalCategory || '',
    hospitalType: currentHospital?.hospitalType || '',
    hospitalServices: currentHospital?.hospitalServices || '',
    isActive: currentHospital?.isActive ? '1' : '0' || '',
    // imageUpload: currentHospital?.imageUpload
    //   ? {
    //       fileUrl: currentHospital.imageUpload.fileUrl,
    //       preview: currentHospital.imageUpload.fileUrl,
    //     }
    //   : '',
  }),
  [currentHospital]
);


  const methods = useForm({
    resolver: yupResolver(NewHospitalSchema),
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
        hospitalName: formData.hospitalName,
        hospitalRegNum: Number(formData.hospitalRegNum),
        hospitalCategory: formData.hospitalCategory,
        hospitalType: formData.hospitalType,
        hospitalServices: formData.hospitalServices,
        isActive: formData.isActive,
        // imageUpload: {
        //   fileUrl: formData.imageUpload?.fileUrl,
        // },
      };
      await axiosInstance.patch(`/hospitals/${currentHospital.id}`, inputData);
      refreshHospitals();
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', formData);
    } catch (error) {
      console.error(error);
    }
  });

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
            fileUrl, 
            preview: fileUrl, 
          },
          { shouldValidate: true }
        );
      }
    },
    [setValue]
  );
  const handleRemoveFile = useCallback(() => {
    setValue('coverUrl', null);
  }, [setValue]);

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
          {!currentHospital?.isActive && (
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

            <RHFTextField name="hospitalName" label="Hospital Name" />
            <RHFTextField name="hospitalRegNum" label="Hospital Register Number" />
            <RHFTextField name="hospitalCategory" label="Hospital Category" />
            <RHFTextField name="hospitalType" label="Hospital Type" />
            <RHFTextField name="hospitalServices" label="Hospital Services" />            
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

HospitalQuickEditForm.propTypes = {
  currentHospital: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshHospitals: PropTypes.func,
};

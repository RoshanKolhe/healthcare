import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
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
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
// import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';
import { USER_STATUS_OPTIONS } from 'src/utils/constants';
import { paths } from 'src/routes/paths';
import { useGetCategorys } from 'src/api/categorys';
import { useGetHospitalServices } from 'src/api/hospital-service';
import { useGetHospitalTypes } from 'src/api/hospital-type';

// ----------------------------------------------------------------------

export default function HospitalQuickEditForm({
  currentHospital,
  open,
  onClose,
  refreshHospitals,
}) {
  console.log('currentHospital', currentHospital);
  console.log('currentHospital', open);

  const { categorys } = useGetCategorys();
  const { hospitalServices } = useGetHospitalServices();
  const { hospitalTypes } = useGetHospitalTypes();

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const NewHospitalSchema = Yup.object().shape({
    hospitalName: Yup.string().required('Hospital Name is required'),
    hospitalRegNum: Yup.number().required('Hospital Register Number is required'),
    category: Yup.object().required('Hospital Category is required'),
    hospitalType: Yup.object().required('Hospital Type is required'),
    hospitalService: Yup.object().required('Hospital Services is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      hospitalName: currentHospital?.hospitalName || '',
      hospitalRegNum: currentHospital?.hospitalRegNum || '',
      category: currentHospital?.category || '',
      hospitalType: currentHospital?.hospitalType || '',
      hospitalService: currentHospital?.hospitalService || '',
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
        categoryId: formData.category?.id,
        hospitalServiceId: formData.hospitalService?.id,
        hospitalTypeId: formData.hospitalType?.id,
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
      router.push(paths.dashboard.hospital.list);
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

  useEffect(() => {
    if (currentHospital) {
      reset(defaultValues);
    }
  }, [currentHospital, defaultValues, reset]);

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
            <RHFAutocomplete
              name="category"
              label="Category"
              options={categorys}
              getOptionLabel={(option) => option?.category || ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
            />
            <RHFAutocomplete
              name="hospitalType"
              label="Type"
              options={hospitalTypes}
              getOptionLabel={(option) => option?.hospitalType || ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
            />
            <RHFAutocomplete
              name="hospitalService"
              label="Services"
              options={hospitalServices}
              getOptionLabel={(option) => option?.hospitalService || ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
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

HospitalQuickEditForm.propTypes = {
  currentHospital: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshHospitals: PropTypes.func,
};

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
import { useGetCategorys, useGetCategorysWithFilter } from 'src/api/categorys';
import { useGetClinicServices, useGetClinicServicesWithFilter } from 'src/api/clinic-service';
import { useGetClinicTypes, useGetClinicTypesWithFilter } from 'src/api/clinic-type';

// ----------------------------------------------------------------------

export default function ClinicQuickEditForm({
  currentClinic,
  open,
  onClose,
  refreshClinics,
}) {
  console.log('currentClinic', currentClinic);
  console.log('currentClinic', open);
const filter = {
    where:{
      isActive: true,
    }
  }
  const fillterString = encodeURIComponent(JSON.stringify(filter));
  
  const { filteredCategorys : categorys } = useGetCategorysWithFilter(fillterString);
  const { filteredClinicServices : clinicServices  } = useGetClinicServicesWithFilter(fillterString);
  const { filteredClinicTypes : clinicTypes } = useGetClinicTypesWithFilter(fillterString);

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const NewClinicSchema = Yup.object().shape({
    clinicName: Yup.string().required('Clinic Name is required'),
    clinicRegNum: Yup.string().required('Clinic Register Number is required'),
    category: Yup.object().required('Clinic Category is required'),
    clinicType: Yup.object().required('Clinic Type is required'),
    clinicService: Yup.object().required('Clinic Services is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      clinicName: currentClinic?.clinicName || '',
      clinicRegNum: currentClinic?.clinicRegNum || '',
      category: currentClinic?.category || '',
      clinicType: currentClinic?.clinicType || '',
      clinicService: currentClinic?.clinicService || '',
      isActive: currentClinic?.isActive ? '1' : '0' || '',
      // imageUpload: currentClinic?.imageUpload
      //   ? {
      //       fileUrl: currentClinic.imageUpload.fileUrl,
      //       preview: currentClinic.imageUpload.fileUrl,
      //     }
      //   : '',
    }),
    [currentClinic]
  );

  const methods = useForm({
    resolver: yupResolver(NewClinicSchema),
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
        clinicName: formData.clinicName,
        clinicRegNum: formData.clinicRegNum,
        categoryId: formData.category?.id,
        clinicServiceId: formData.clinicService?.id,
        clinicTypeId: formData.clinicType?.id,
        isActive: formData.isActive,
        // imageUpload: {
        //   fileUrl: formData.imageUpload?.fileUrl,
        // },
      };
      await axiosInstance.patch(`/clinics/${currentClinic.id}`, inputData);
      refreshClinics();
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      router.push(paths.dashboard.clinic.list);
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
    if (currentClinic) {
      reset(defaultValues);
    }
  }, [currentClinic, defaultValues, reset]);

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
          {!currentClinic?.isActive && (
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

            <RHFTextField name="clinicName" label="Clinic Name" />
            <RHFTextField name="clinicRegNum" label="Clinic Register Number" />
            <RHFAutocomplete
              name="category"
              label="Category"
              options={categorys}
              getOptionLabel={(option) => option?.category || ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
            />
            <RHFAutocomplete
              name="clinicType"
              label="Type"
              options={clinicTypes}
              getOptionLabel={(option) => option?.clinicType || ''}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
            />
            <RHFAutocomplete
              name="clinicService"
              label="Services"
              options={clinicServices}
              getOptionLabel={(option) => option?.clinicService || ''}
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

ClinicQuickEditForm.propTypes = {
  currentClinic: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshClinics: PropTypes.func,
};

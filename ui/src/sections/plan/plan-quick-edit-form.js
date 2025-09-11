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

export default function PlanQuickEditForm({
  currentPlan,
  open,
  onClose,
  refreshPlans,
}) {
  console.log('currentPlan',currentPlan);
  console.log('currentPlan',open);

  const { enqueueSnackbar } = useSnackbar();

  const NewPlanSchema = Yup.object().shape({
    planName: Yup.string().required('Plan Name is required'),
    planRegNum: Yup.number().required('Plan Register Number is required'),
    planCategory: Yup.string().required('Plan Category is required'),
    planType: Yup.string().required('Plan Type is required'),
    planServices: Yup.string().required('Plan Services is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
  () => ({
    planName: currentPlan?.planName || '',
    planRegNum: currentPlan?.planRegNum || '',
    planCategory: currentPlan?.planCategory || '',
    planType: currentPlan?.planType || '',
    planServices: currentPlan?.planServices || '',
    isActive: currentPlan?.isActive ? '1' : '0' || '',
    // imageUpload: currentPlan?.imageUpload
    //   ? {
    //       fileUrl: currentPlan.imageUpload.fileUrl,
    //       preview: currentPlan.imageUpload.fileUrl,
    //     }
    //   : '',
  }),
  [currentPlan]
);


  const methods = useForm({
    resolver: yupResolver(NewPlanSchema),
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
        planName: formData.planName,
        planRegNum: Number(formData.planRegNum),
        planCategory: formData.planCategory,
        planType: formData.planType,
        planServices: formData.planServices,
        isActive: formData.isActive,
        // imageUpload: {
        //   fileUrl: formData.imageUpload?.fileUrl,
        // },
      };
      await axiosInstance.patch(`/plans/${currentPlan.id}`, inputData);
      refreshPlans();
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
          {!currentPlan?.isActive && (
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

            <RHFTextField name="planName" label="Plan Name" />
            <RHFTextField name="planRegNum" label="Plan Register Number" />
            <RHFTextField name="planCategory" label="Plan Category" />
            <RHFTextField name="planType" label="Plan Type" />
            <RHFTextField name="planServices" label="Plan Services" />            
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

PlanQuickEditForm.propTypes = {
  currentPlan: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshPlans: PropTypes.func,
};

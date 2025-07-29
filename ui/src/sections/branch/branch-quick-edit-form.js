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

export default function BranchQuickEditForm({
  currentBranch,
  open,
  onClose,
  refreshBranchs,
}) {
  console.log('currentBranch',currentBranch);
  console.log('currentBranch',open);

  const { enqueueSnackbar } = useSnackbar();

  const NewBranchSchema = Yup.object().shape({
    branchName: Yup.string().required('Branch Name is required'),
    branchRegNum: Yup.number().required('Branch Register Number is required'),
    branchCategory: Yup.string().required('Branch Category is required'),
    branchType: Yup.string().required('Branch Type is required'),
    branchServices: Yup.string().required('Branch Services is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
  () => ({
    branchName: currentBranch?.branchName || '',
    branchRegNum: currentBranch?.branchRegNum || '',
    branchCategory: currentBranch?.branchCategory || '',
    branchType: currentBranch?.branchType || '',
    branchServices: currentBranch?.branchServices || '',
    isActive: currentBranch?.isActive ? '1' : '0' || '',
    // imageUpload: currentBranch?.imageUpload
    //   ? {
    //       fileUrl: currentBranch.imageUpload.fileUrl,
    //       preview: currentBranch.imageUpload.fileUrl,
    //     }
    //   : '',
  }),
  [currentBranch]
);


  const methods = useForm({
    resolver: yupResolver(NewBranchSchema),
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
        branchName: formData.branchName,
        branchRegNum: Number(formData.branchRegNum),
        branchCategory: formData.branchCategory,
        branchType: formData.branchType,
        branchServices: formData.branchServices,
        isActive: formData.isActive,
        // imageUpload: {
        //   fileUrl: formData.imageUpload?.fileUrl,
        // },
      };
      await axiosInstance.patch(`/branchs/${currentBranch.id}`, inputData);
      refreshBranchs();
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
          {!currentBranch?.isActive && (
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

            <RHFTextField name="branchName" label="Branch Name" />
            <RHFTextField name="branchRegNum" label="Branch Register Number" />
            <RHFTextField name="branchCategory" label="Branch Category" />
            <RHFTextField name="branchType" label="Branch Type" />
            <RHFTextField name="branchServices" label="Branch Services" />            
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

BranchQuickEditForm.propTypes = {
  currentBranch: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshBranchs: PropTypes.func,
};

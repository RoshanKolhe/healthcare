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

export default function AgentQuickEditForm({
  currentAgent,
  open,
  onClose,
  refreshAgents,
}) {
  console.log('currentAgent',currentAgent);
  console.log('currentAgent',open);

  const { enqueueSnackbar } = useSnackbar();

  const NewAgentSchema = Yup.object().shape({
    agentName: Yup.string().required('Agent Name is required'),
    agentRegNum: Yup.number().required('Agent Register Number is required'),
    agentCategory: Yup.string().required('Agent Category is required'),
    agentType: Yup.string().required('Agent Type is required'),
    agentServices: Yup.string().required('Agent Services is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
  () => ({
    agentName: currentAgent?.agentName || '',
    agentRegNum: currentAgent?.agentRegNum || '',
    agentCategory: currentAgent?.agentCategory || '',
    agentType: currentAgent?.agentType || '',
    agentServices: currentAgent?.agentServices || '',
    isActive: currentAgent?.isActive ? '1' : '0' || '',
    // imageUpload: currentAgent?.imageUpload
    //   ? {
    //       fileUrl: currentAgent.imageUpload.fileUrl,
    //       preview: currentAgent.imageUpload.fileUrl,
    //     }
    //   : '',
  }),
  [currentAgent]
);


  const methods = useForm({
    resolver: yupResolver(NewAgentSchema),
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
        agentName: formData.agentName,
        agentRegNum: Number(formData.agentRegNum),
        agentCategory: formData.agentCategory,
        agentType: formData.agentType,
        agentServices: formData.agentServices,
        isActive: formData.isActive,
        // imageUpload: {
        //   fileUrl: formData.imageUpload?.fileUrl,
        // },
      };
      await axiosInstance.patch(`/agents/${currentAgent.id}`, inputData);
      refreshAgents();
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
          {!currentAgent?.isActive && (
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

            <RHFTextField name="agentName" label="Agent Name" />
            <RHFTextField name="agentRegNum" label="Agent Register Number" />
            <RHFTextField name="agentCategory" label="Agent Category" />
            <RHFTextField name="agentType" label="Agent Type" />
            <RHFTextField name="agentServices" label="Agent Services" />            
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

AgentQuickEditForm.propTypes = {
  currentAgent: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshAgents: PropTypes.func,
};

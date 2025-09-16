import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';
import { useParams, useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { useGetBooking } from 'src/api/booking';
import { Stack, TextField, Typography } from '@mui/material';
import { MultiFilePreview } from 'src/components/upload';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function SummaryManagementQuickEditForm({
  currentSummaryManagement,
  open,
  onClose,
  refreshBookings,
}) {
  const filter = {
    where: {
      isActive: true,
    },
  };
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState(false);
  const confirm = useBoolean();
  const fillterString = encodeURIComponent(JSON.stringify(filter));

  const { enqueueSnackbar } = useSnackbar();

  const params = useParams();

  const router = useRouter();
  console.log('currentSummaryManagement', currentSummaryManagement);

  const NewSummaryManagementSchema = Yup.object().shape({
    feedback: Yup.string(),
    summary: Yup.string(),
    file: Yup.string(),
    status: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      feedback: currentSummaryManagement?.reportSummary?.feedback || '',
      summary: currentSummaryManagement?.reportSummary?.summary || '',
      file: currentSummaryManagement?.reportSummary?.file || '',
    }),
    [currentSummaryManagement]
  );

  const methods = useForm({
    resolver: yupResolver(NewSummaryManagementSchema),
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
        feedback: formData.feedback,
        summary: formData.summary,
        patientBookingId: currentSummaryManagement?.id || params.id,
      };
      if (!currentSummaryManagement?.summaryManagement?.id) {
        await axiosInstance.post('/summary-managements', inputData);
      } else {
        await axiosInstance.patch(
          `/summary-managements/${currentSummaryManagement?.summaryManagement?.id}`,
          inputData
        );
      }
      refreshBookings();
      reset();
      onClose();
      enqueueSnackbar(currentSummaryManagement ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.booking.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
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

  const handleSummaryApproval = async () => {
    setLoading(true);
    try {
      const inputData = {
        status: 1,
        summary: values.summary,
        feedback: 'Your summary is approved',
      };
      await axiosInstance.patch(
        `/report-summaries/${currentSummaryManagement?.reportSummary?.id}`,
        inputData
      );
      enqueueSnackbar('Summary approved successfully');
      refreshBookings();
      onClose();
    } catch (error) {
      console.error('Error approving summary:', error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error?.message, {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryRejection = async () => {
    setLoading(true);
    try {
      const inputData = {
        feedback: rejectReason,
        status: 2,
      };
      await axiosInstance.patch(
        `/report-summaries/${currentSummaryManagement?.reportSummary?.id}`,
        inputData
      );
      refreshBookings();
      onClose();
      enqueueSnackbar('Summary Rejected Successfully');
      setRejectError(false);
      confirm.onFalse();
    } catch (error) {
      console.error('Error saving user details:', error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
      confirm.onFalse();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSummaryManagement) {
      reset(defaultValues);
    }
  }, [currentSummaryManagement, defaultValues, reset]);

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
        <DialogTitle>Medical Report Summary</DialogTitle>

        <DialogContent>
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
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Report PFD
              </Typography>
              <MultiFilePreview
                files={
                  currentSummaryManagement?.reportSummary?.file?.fileUrl
                    ? [currentSummaryManagement.reportSummary.file.fileUrl]
                    : []
                }
                thumbnail
              />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <RHFTextField
                name="summary"
                label="Summary"
                multiline
                maxRows={10}
                fullWidth
              />
            </Box>
            <ConfirmDialog
              open={confirm.value}
              onClose={confirm.onFalse}
              content={
                <Stack spacing={2}>
                  <span>Pleas provide the reason for rejecting this summary report.</span>
                  <TextField
                    label="Reason for rejection"
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={3}
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);
                      if (rejectError) setRejectError(false);
                    }}
                    error={rejectError}
                    helperText={rejectError ? 'Please provide a reason for rejection.' : ''}
                  />
                </Stack>
              }
              action={
                <LoadingButton
                  variant="contained"
                  color="error"
                  loading={loading}
                  onClick={() => {
                    if (!rejectReason.trim()) {
                      setRejectError(true);
                      return;
                    }
                    handleSummaryRejection();
                  }}
                >
                  Reject Summary
                </LoadingButton>
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => confirm.onTrue()}
            disabled={
              currentSummaryManagement?.reportSummary?.status === 1 ||
              currentSummaryManagement?.reportSummary?.status === 2
            }
          >
            Reject
          </Button>

          <LoadingButton
            variant="contained"
            color="success"
            loading={loading}
            onClick={handleSummaryApproval}
            disabled={currentSummaryManagement?.reportSummary?.status === 1}
          >
            Approve
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

SummaryManagementQuickEditForm.propTypes = {
  currentSummaryManagement: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshBookings: PropTypes.func,
};

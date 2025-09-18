import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';
// components
import { Typography } from '@mui/material';
import { useRouter } from 'src/routes/hook';
import { MultiFilePreview } from 'src/components/upload';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function SoapView({ currentSummaryManagement, open, onClose, refreshBookings }) {
  console.log('currentSummaryManagement', currentSummaryManagement);
  const router = useRouter();

  const NewSummaryManagementSchema = Yup.object().shape({
    file: Yup.object(),
    soapSummary: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      file: currentSummaryManagement?.reportSummary?.file || '',
      soapSummary: currentSummaryManagement?.soapSummary || '',
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
    formState: { isSubmitting, errors},
  } = methods;
  console.log('errors',errors);
  console.log('values',methods.watch());

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        file: currentSummaryManagement?.file || {},
        soapSummary: formData.soapSummary,
      };
      await axiosInstance.patch(
        `/patient-bookings/${currentSummaryManagement?.id}/soap-file`,
        inputData
      );
      refreshBookings();
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', formData);
    } catch (error) {
      console.error(error);
    }
  });

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
          <DialogTitle>SOAP</DialogTitle>

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
                  SOAP PFD
                </Typography>
                <MultiFilePreview
                  files={
                    currentSummaryManagement?.file?.fileUrl
                      ? [currentSummaryManagement.file.fileUrl]
                      : []
                  }
                  thumbnail
                />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <RHFTextField name="soapSummary" label="Summary" multiline maxRows={10} fullWidth />
              </Box>
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

SoapView.propTypes = {
  currentSummaryManagement: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshBookings: PropTypes.func,
};

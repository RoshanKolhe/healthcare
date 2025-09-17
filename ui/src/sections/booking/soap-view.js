import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// components
import { Typography } from '@mui/material';
import { MultiFilePreview } from 'src/components/upload';

// ----------------------------------------------------------------------

export default function SoapView({ currentSummaryManagement, open, onClose, refreshBookings }) {

  console.log('currentSummaryManagement', currentSummaryManagement);

  const NewSummaryManagementSchema = Yup.object().shape({
    file: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
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
  } = methods;

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
      <FormProvider methods={methods}>
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
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
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

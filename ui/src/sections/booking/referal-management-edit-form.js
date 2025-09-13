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
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';
import { useParams, useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { useGetBooking } from 'src/api/booking';

// ----------------------------------------------------------------------

export default function ReferalManagementQuickEditForm({
  currentReferalManagement,
  open,
  onClose,
  refreshBookings,
}) {
  const filter = {
    where: {
      isActive: true,
    },
  };
  const fillterString = encodeURIComponent(JSON.stringify(filter));

  const { enqueueSnackbar } = useSnackbar();

  const params = useParams();

  const router = useRouter();
  console.log('currentReferalManagement',currentReferalManagement);

  const NewReferalManagementSchema = Yup.object().shape({
    referalReason: Yup.string().required('Referal Reason is required'),
    clinicNote: Yup.string().required('Clinic Note is required'),
    doctorName: Yup.string().required('DoctorName is required'),
    doctorPhone: Yup.string().required('DoctorPhone is required'),
    doctorEmail: Yup.string().required('DoctorEmail is required'),
    clinicName: Yup.string().required('ClinicName is required'),
    clinicAddress: Yup.string().required('ClinicAddress is required'),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      patientName: currentReferalManagement?.patientFullDetail?.patientName || '',
      phoneNo: currentReferalManagement?.patientFullDetail?.phoneNo || '',
      email: currentReferalManagement?.patientFullDetail?.email || '',
      referalReason: currentReferalManagement?.referalManagement?.referalReason || '',
      clinicNote: currentReferalManagement?.referalManagement?.clinicNote || '',
      doctorName: currentReferalManagement?.referalManagement?.doctorName || '',
      doctorPhone: currentReferalManagement?.referalManagement?.doctorPhone || '',
      doctorEmail: currentReferalManagement?.referalManagement?.doctorEmail || '',
      clinicName: currentReferalManagement?.referalManagement?.clinicName || '',
      clinicAddress: currentReferalManagement?.referalManagement?.clinicAddress || '',
    }),
    [currentReferalManagement]
  );

  const methods = useForm({
    resolver: yupResolver(NewReferalManagementSchema),
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
        referalReason: formData.referalReason,
        clinicNote: formData.clinicNote,
        doctorName: formData.doctorName,
        doctorPhone: formData.doctorPhone,
        doctorEmail: formData.doctorEmail,
        clinicName: formData.clinicName,
        clinicAddress: formData.clinicAddress,
        patientBookingId: currentReferalManagement?.id || params.id,
      };
      if (!currentReferalManagement?.referalManagement?.id) {
        await axiosInstance.post('/referal-managements', inputData);
      } else {
        await axiosInstance.patch(`/referal-managements/${currentReferalManagement?.referalManagement?.id}`, inputData);
      }
      refreshBookings();
      reset();
      onClose();
      enqueueSnackbar(currentReferalManagement ? 'Update success!' : 'Create success!');
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

  useEffect(() => {
    if (currentReferalManagement) {
      reset(defaultValues);
    }
  }, [currentReferalManagement, defaultValues, reset]);

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
            <RHFTextField name="patientName" label="Patient Name" disabled />
            <RHFTextField name="phoneNo" label="Patient Phone" disabled />
            <RHFTextField name="email" label="Patient Email" disabled />
            <RHFTextField name="referalReason" label="Referal Reason" />
            <RHFTextField name="clinicNote" label="Clinic Note" />
            <RHFTextField name="doctorName" label="Doctor Name" />
            <RHFTextField name="doctorPhone" label="Doctor Phone" />
            <RHFTextField name="doctorEmail" label="Doctor Email" />
            <RHFTextField name="clinicName" label="Clinic Name" />
            <RHFTextField name="clinicAddress" label="Clinic Address" />
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

ReferalManagementQuickEditForm.propTypes = {
  currentReferalManagement: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshBookings: PropTypes.func,
};

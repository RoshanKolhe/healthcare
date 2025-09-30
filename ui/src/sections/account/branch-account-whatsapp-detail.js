/* eslint-disable no-useless-escape */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { useGetWhatsappDetail } from 'src/api/whatsapp-detail';

// ----------------------------------------------------------------------

export default function BranchWhatsappEditForm({ id, setId }) {
  const { whatsappDetail: currentWhatsappDetail, refreshWhatsappDetails } =
    useGetWhatsappDetail(id);
  const router = useRouter();

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewClinicSchema = Yup.object().shape({
    phoneNo: Yup.string().required('Whatsapp Number is required'),
    clientId: Yup.string().required('Client Id is required'),
    clientSecret: Yup.string().required('Client Secret is required'),
    accessToken: Yup.string().required('Access Token is required'),
    businessAccountId: Yup.string().required('Business Account Id is required'),
  });

  const defaultValues = useMemo(
    () => ({
      phoneNo: currentWhatsappDetail?.phoneNo || '',
      clientId: currentWhatsappDetail?.clientId || '',
      clientSecret: currentWhatsappDetail?.clientSecret || '',
      accessToken: currentWhatsappDetail?.accessToken || '',
      businessAccountId: currentWhatsappDetail?.businessAccountId || '',
    }),
    [currentWhatsappDetail]
  );

  const methods = useForm({
    resolver: yupResolver(NewClinicSchema),
    defaultValues,
  });
  console.log('defaultValues', defaultValues);

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const Payload = {
        phoneNo: formData.phoneNo,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        accessToken: formData.accessToken,
        businessAccountId: formData.businessAccountId,
        branchId: user?.branch?.id,
      };
      if (!currentWhatsappDetail) {
        const response = await axiosInstance.post('/branch-whatsapps', Payload);
        if (response?.data) {
          setId(response?.data?.id);
          refreshWhatsappDetails(response?.data?.id);
        }
      } else {
        await axiosInstance.patch(`/branch-whatsapps/${currentWhatsappDetail.id}`, Payload);
      }
      refreshWhatsappDetails();
      reset({
        phoneNo: currentWhatsappDetail?.phoneNo || Payload.phoneNo,
        clientId: currentWhatsappDetail?.clientId || Payload.clientId,
        clientSecret: currentWhatsappDetail?.clientSecret || Payload.clientSecret,
        accessToken: currentWhatsappDetail?.accessToken || Payload.accessToken,
        businessAccountId: currentWhatsappDetail?.businessAccountId || Payload.businessAccountId,
      });
      enqueueSnackbar(currentWhatsappDetail ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.whastappDetail.edit);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentWhatsappDetail) {
      reset(defaultValues);
    }
  }, [currentWhatsappDetail, defaultValues, reset]);

  const renderDetails = (
    <Grid xs={12} md={12}>
      <Card sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={2} xs={12} md={12}>
            <Grid xs={12} md={6}>
              <RHFTextField name="phoneNo" label="Whatsapp Number" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="clientId" label="Client Id" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="clientSecret" label="Client Secret" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="accessToken" label="Access Token" />
            </Grid>
            <Grid xs={12} md={6}>
              <RHFTextField name="businessAccountId" label="Business Account Id" />
            </Grid>
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentWhatsappDetail ? 'Create Whatsapp account' : 'Save Changes'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}
      </Grid>
    </FormProvider>
  );
}

BranchWhatsappEditForm.propTypes = {
  id: PropTypes.number,
  setId: PropTypes.func,
};

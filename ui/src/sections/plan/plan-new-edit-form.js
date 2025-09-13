/* eslint-disable no-useless-escape */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFEditor,
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { MenuItem } from '@mui/material';
import { useResponsive } from 'src/hooks/use-responsive';
import axiosInstance from 'src/utils/axios';
import { fData } from 'src/utils/format-number';
import { features } from 'process';
import { BILLING_CYCLE_OPTIONS, COMMON_STATUS_OPTIONS, TIER_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function PlanNewEditForm({ currentPlan }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewPlanSchema = Yup.object().shape({
    name: Yup.string().required('Plan Name is required'),
    description: Yup.string(),
    features: Yup.string().required('Features is required'),
    thumbnail: Yup.mixed().required('Thumbnail is required'),
    isActive: Yup.boolean(),
    billingCycle: Yup.string().required('Billing Cycle is required'),
    tier: Yup.string().required('Tier is required'),
    priceINR: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be a positive number')
      .required(),
    discountedPriceINR: Yup.number()
      .typeError('Discounted Price must be a number')
      .positive('Discounted Price must be positive')
      .required('Discounted Price is required')
      .max(Yup.ref('priceINR'), 'Discounted Price cannot be greater than Actual Price'),

    priceUSD: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be a positive number')
      .required(),
    discountedPriceUSD: Yup.number()
      .typeError('Discounted Price must be a number')
      .positive('Discounted Price must be positive')
      .required('Discounted Price is required')
      .max(Yup.ref('priceUSD'), 'Discounted Price cannot be greater than Actual Price'),
    taxPercentageINR: Yup.number()
      .typeError('Tax Percent must be a number')
      .positive('Tax Percent must be a positive number')
      .required(),
    taxPercentageUSD: Yup.number()
      .typeError('Tax Percent must be a number')
      .positive('Tax Percent must be a positive number')
      .required(),
    bookingLimit: Yup.number()
      .typeError('Booking Limit must be a number')
      .positive('Booking Limit must be a positive number')
      .required(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPlan?.name || '',
      features: currentPlan?.features || '',
      thumbnail: currentPlan?.thumbnail?.fileUrl || '',
      isActive: currentPlan ? (currentPlan?.isActive ? '1' : '0') : '1',
      billingCycle: currentPlan?.billingCycle || '',
      tier: currentPlan?.tier || '',
      priceINR: currentPlan?.priceINR || 0,
      discountedPriceINR: currentPlan?.discountedPriceINR || 0,
      priceUSD: currentPlan?.priceUSD || 0,
      discountedPriceUSD: currentPlan?.discountedPriceUSD || 0,
      taxPercentageINR: currentPlan?.taxPercentageINR || 0,
      taxPercentageUSD: currentPlan?.taxPercentageUSD || 0,
      bookingLimit: currentPlan?.bookingLimit || 0,
    }),
    [currentPlan]
  );

  const methods = useForm({
    resolver: yupResolver(NewPlanSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        name: formData.name,
        features: formData.features,
        isActive: currentPlan ? formData.isActive : true,
        billingCycle: formData.billingCycle,
        tier: formData.tier,
        priceINR: formData.priceINR,
        discountedPriceINR: formData.discountedPriceINR,
        priceUSD: formData.priceUSD,
        discountedPriceUSD: formData.discountedPriceUSD,
        taxPercentageINR: formData.taxPercentageINR,
        taxPercentageUSD: formData.taxPercentageUSD,
        bookingLimit: formData.bookingLimit,
      };

      console.log(inputData);
      if (!currentPlan) {
        await axiosInstance.post('/plans', inputData);
      } else {
        await axiosInstance.patch(`/plans/${currentPlan.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentPlan ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.plan.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentPlan) {
      reset(defaultValues);
    }
  }, [currentPlan, defaultValues, reset]);

  const renderDetails = (
    <Grid xs={12} md={12}>
      <Card sx={{ pb: 2 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={2} xs={12} md={12}>
            {currentPlan ? (
              <Grid xs={12} md={6}>
                <RHFSelect name="isActive" label="Status">
                  {COMMON_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
              </Grid>
            ) : null}
            <Grid xs={12} md={12}>
              <RHFTextField name="name" label="Plan Name" />
            </Grid>
            <Grid xs={12} md={12}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Features</Typography>
                <RHFEditor simple name="features" />
              </Stack>
            </Grid>
            <Grid xs={12} md={6}>
              <RHFSelect name="billingCycle" label="Billing Cycle">
                {BILLING_CYCLE_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid xs={12} md={6}>
              <RHFSelect name="tier" label="Tier">
                {TIER_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="priceINR" label="INR Price" type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="discountedPriceINR" label="Discounted INR Price" type="number" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFTextField name="priceUSD" label="USD Price" type="number" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFTextField name="discountedPriceUSD" label="Discounted USD Price" type="number" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFTextField name="taxPercentageINR" label="INR Tax (%)" type="number" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFTextField name="taxPercentageUSD" label="USD Tax (%)" type="number" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFTextField name="bookingLimit" label="Booking Limit" type="number" />
            </Grid>
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentPlan ? 'Create Plan' : 'Save Changes'}
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

PlanNewEditForm.propTypes = {
  currentPlan: PropTypes.object,
};

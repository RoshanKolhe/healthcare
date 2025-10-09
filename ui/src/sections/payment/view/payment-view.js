'use client';

// @mui
import Box from '@mui/material/Box';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { useParams } from 'src/routes/hook';
import { useSnackbar } from 'src/components/snackbar';
//
import { useGetPlan } from 'src/api/plan';
import FormProvider from 'src/components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'src/utils/axios';
import { loadRazorpayScript } from 'src/utils/constants';
import PaymentSummary from '../payment-summary';
import PaymentMethods from '../payment-methods';
import PaymentBillingAddress from '../payment-billing-address';

// ----------------------------------------------------------------------

export default function PaymentView() {
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = params;

  const { plan: selectedPlan } = useGetPlan(id);
  console.log(selectedPlan);

  const validationSchema = Yup.object().shape({
    personName: Yup.string()
      .required('Person name is required')
      .min(2, 'Name must be at least 2 characters'),

    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),

    email: Yup.string().required('Email is required').email('Enter a valid email'),

    address: Yup.string()
      .required('Address is required')
      .min(5, 'Address must be at least 5 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      personName: '',
      phoneNumber: '',
      email: '',
      address: '',
    }),
    []
  );
  // const mergedSchema = NewUserSchema.concat(validationSchema);
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // const onSubmit = handleSubmit(async (formData) => {
  //   try {
  //     console.log(formData);
  //     const inputData = {
  //       paymentDetails: {
  //         ...formData,
  //       },
  //       planId: selectedPlan.id,
  //     };
  //     const response = await axiosInstance.post('/clinic-subscriptions', inputData);
  //     console.log(response.data.paymentObject);
  //     const razorpayData = response.data.paymentObject;
  //     console.log('razorpayData', razorpayData);
  //     const subscriptionId = razorpayData.subscriptionId;
  //     console.log('subscriptionId', subscriptionId);

  //     const options = {
  //       key: razorpayData.razorpayKeyId,
  //       amount: razorpayData.amount, // in paise
  //       currency: razorpayData.currency,
  //       order_id: razorpayData.orderId,
  //       handler: async (razorpayResponse) => {
  //         console.log('Razorpay Success:', razorpayResponse);
  //         try {
  //           const inputRazorpayData = {
  //             subscription_id: razorpayData.subscriptionId,
  //             razorpay_order_id: razorpayResponse.razorpay_order_id,
  //             razorpay_payment_id: razorpayResponse.razorpay_payment_id,
  //             razorpay_signature: razorpayResponse.razorpay_signature,
  //           };

  //           console.log('Verifying payment with data:', inputRazorpayData);

  //           const verifyRes = await axiosInstance.post(
  //             '/subscriptions/callback/verify',
  //             inputRazorpayData
  //           );

  //           console.log('Verification response:', verifyRes.data);

  //           if (verifyRes.data.success) {
  //             sessionStorage.setItem('subscriptionId', razorpayData.subscriptionId);
  //             // window.location.href = `/dashboard/payment/success?subscriptionId=${razorpayData.subscriptionId}`;
  //           } else {
  //             // window.location.href = '/marketplace/pricing';
  //           }
  //         } catch (err) {
  //           console.error('Verification failed:', err);
  //           alert('Server error verifying payment.');
  //           window.location.href = '/marketplace/pricing';
  //         }
  //       },
  //     };

  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //     // reset();
  //     // enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
  //     // router.push(paths.dashboard.user.list);
  //   } catch (error) {
  //     console.error(error);
  //     enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
  //       variant: 'error',
  //     });
  //   }
  // });
  // helper function to verify payment
  async function verifyPayment(subscriptionId, razorpayResponse) {
    try {
      const inputRazorpayData = {
        subscription_id: subscriptionId,
        razorpay_order_id: razorpayResponse?.razorpay_order_id || null,
        razorpay_payment_id: razorpayResponse?.razorpay_payment_id || null,
        razorpay_signature: razorpayResponse?.razorpay_signature || null,
      };

      console.log('Verifying payment with data:', inputRazorpayData);

      const verifyRes = await axiosInstance.post(
        '/subscriptions/callback/verify',
        inputRazorpayData
      );

      console.log('Verification response:', verifyRes.data);

      if (verifyRes.data.success) {
        sessionStorage.setItem('subscriptionId', subscriptionId);
        window.location.href = `/dashboard/payment/success?subscriptionId=${subscriptionId}`;
      } else {
        window.location.href = '/marketplace/pricing';
      }
    } catch (err) {
      console.error('Verification failed:', err);
      alert('Server error verifying payment.');
      window.location.href = '/marketplace/pricing';
    }
  }

  // helper function to cancel payment
  async function cancelPayment(subscriptionId) {
    try {
      console.log('Cancelling subscription:', subscriptionId);

      await axiosInstance.post('/subscriptions/callback/cancel', {
        subscription_id: subscriptionId,
      });

      // window.location.href = '/marketplace/pricing';
    } catch (err) {
      console.error('Cancel failed:', err);
      // window.location.href = '/marketplace/pricing';
    }
  }

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        paymentDetails: {
          ...formData,
        },
        planId: selectedPlan.id,
      };
      const response = await axiosInstance.post('/clinic-subscriptions', inputData);
      console.log(response.data.paymentObject);

      const razorpayData = response.data.paymentObject;
      const subscriptionId = razorpayData.subscriptionId;
      console.log('razorpayData', razorpayData);
      console.log('subscriptionId', subscriptionId);

      const options = {
        key: razorpayData.razorpayKeyId,
        amount: razorpayData.amount, // in paise
        currency: razorpayData.currency,
        order_id: razorpayData.orderId,
        handler: async (razorpayResponse) => {
          console.log('Razorpay Success:', razorpayResponse);
          await verifyPayment(subscriptionId, razorpayResponse);
        },
        modal: {
          ondismiss: async () => {
            console.log('Payment modal closed by user. Cancelling...');
            await cancelPayment(subscriptionId);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Container
        sx={{
          pb: 10,
          minHeight: 1,
        }}
      >
        <Typography variant="h3" align="center" paragraph>
          {`Let's finish powering you up!`}
        </Typography>

        <Typography align="center" sx={{ color: 'text.secondary', mb: 5 }}>
          This plan is right for you.
        </Typography>

        <Grid container rowSpacing={{ xs: 5, md: 0 }} columnSpacing={{ xs: 0, md: 5 }}>
          <Grid xs={12} md={8}>
            <Box
              gap={5}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
              sx={{
                p: { md: 5 },
                borderRadius: 2,
                border: (theme) => ({
                  md: `dashed 1px ${theme.palette.divider}`,
                }),
              }}
            >
              <PaymentBillingAddress />

              <PaymentMethods />
            </Box>
          </Grid>

          <Grid xs={12} md={4}>
            <PaymentSummary plan={selectedPlan} />
          </Grid>
        </Grid>
      </Container>
    </FormProvider>
  );
}

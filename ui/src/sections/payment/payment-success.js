'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'src/routes/hook';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useSearchParams } from 'next/navigation';
import axiosInstance from 'src/utils/axios';
import Iconify from 'src/components/iconify'; // ✅ Use Iconify

// Styled components with animations
const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const rippleAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.background.default,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
}));

const SuccessCard = styled(Card)(({ theme }) => ({
  maxWidth: 500,
  width: '100%',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #4CAF50, #45a049)',
    borderRadius: '20px 20px 0 0',
  },
}));

const SuccessIcon = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 30px',
  position: 'relative',
  animation: `${pulseAnimation} 2s infinite`,
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 120,
    height: 120,
    border: '3px solid #4CAF50',
    borderRadius: '50%',
    animation: `${rippleAnimation} 2s infinite`,
  },
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const TransactionBox = styled(Paper)(({ theme }) => ({
  background: '#e8f5e8',
  border: '2px dashed #4CAF50',
  borderRadius: 12,
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
  },
  transition: 'all 0.3s ease',
}));

const PaymentSuccessPage = () => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscriptionId');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (subscriptionId) {
      axiosInstance
        .get(`/clinic-subscriptions/${subscriptionId}`)
        .then((res) => {
          setSubscription(res.data);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [subscriptionId]);

  const handleCopyTransactionId = async () => {
    if (!subscription?.transactionId) return;
    try {
      await navigator.clipboard.writeText(subscription.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy transaction ID:', err);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleDownloadReceipt = () => {
    console.log('Downloading receipt...');
  };

  if (!mounted || loading) {
    return (
      <StyledContainer maxWidth={false}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2, color: 'white' }}>
            Fetching your subscription details...
          </Typography>
        </Box>
      </StyledContainer>
    );
  }

  if (!subscription) {
    return (
      <StyledContainer maxWidth={false}>
        <SuccessCard>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              Subscription not found!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              We couldn&apos;t find your subscription details. Please contact support.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </SuccessCard>
      </StyledContainer>
    );
  }

  const paymentData = {
    plan: subscription.planName || `Plan ${subscription.planId}`,
    status: subscription.status === 'active' ? 'Confirmed' : subscription.status,
    expiryDate: new Date(subscription.expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    bookingLimit: `${subscription.bookingLimit} bookings`,
    amountPaid: `₹${subscription.totalAmount}`,
    transactionId: subscription.transactionId || subscription.id,
  };

  return (
    <StyledContainer maxWidth={false}>
      <Zoom in={mounted} timeout={800}>
        <SuccessCard>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            <Fade in={mounted} timeout={1000}>
              <SuccessIcon>
                <Iconify icon="mdi:check-circle" width={50} color="white" />
              </SuccessIcon>
            </Fade>

            <Typography
              variant="h4"
              component="h1"
              sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}
            >
              Payment Successful!
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your payment has been processed successfully. Thank you for your purchase!
            </Typography>

            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'grey.50',
                borderRadius: 2,
                p: 3,
                mb: 3,
              }}
            >
              <DetailRow>
                <Typography variant="body1" fontWeight={600}>
                  Plan
                </Typography>
                <Typography variant="body1">{paymentData.plan}</Typography>
              </DetailRow>

              <DetailRow>
                <Typography variant="body1" fontWeight={600}>
                  Status
                </Typography>
                <Chip
                  label={paymentData.status}
                  color="success"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                  }}
                />
              </DetailRow>

              <DetailRow>
                <Typography variant="body1" fontWeight={600}>
                  Expiry Date
                </Typography>
                <Typography variant="body1">{paymentData.expiryDate}</Typography>
              </DetailRow>

              <DetailRow>
                <Typography variant="body1" fontWeight={600}>
                  Booking Limit
                </Typography>
                <Typography variant="body1">{paymentData.bookingLimit}</Typography>
              </DetailRow>

              <DetailRow>
                <Typography variant="body1" fontWeight={600}>
                  Amount Paid
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: 'success.main', fontWeight: 700 }}
                >
                  {paymentData.amountPaid}
                </Typography>
              </DetailRow>
            </Paper>

            <TransactionBox elevation={0}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  <strong>Transaction ID</strong>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'success.dark',
                    wordBreak: 'break-all',
                  }}
                >
                  {paymentData.transactionId}
                </Typography>
              </Box>
              {subscription?.transactionId && (
                <IconButton size="small" onClick={handleCopyTransactionId} sx={{ ml: 1 }}>
                  <Iconify icon="mdi:content-copy" width={18} />
                </IconButton>
              )}
            </TransactionBox>

            {copied && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ display: 'block', mt: 1 }}
              >
                Transaction ID copied!
              </Typography>
            )}

            <Grid container spacing={2} sx={{ mt: 4 }}>
              <Grid item xs={12} sm={6}>
                <GradientButton
                  fullWidth
                  variant="contained"
                  startIcon={<Iconify icon="mdi:view-dashboard" />}
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard
                </GradientButton>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:download" />}
                  onClick={handleDownloadReceipt}
                  sx={{
                    borderRadius: 3,
                    padding: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 },
                  }}
                >
                  Download Receipt
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </SuccessCard>
      </Zoom>
    </StyledContainer>
  );
};

export default PaymentSuccessPage;
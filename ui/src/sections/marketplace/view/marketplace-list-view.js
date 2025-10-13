'use client';

import React from 'react';
import { Grid, CircularProgress, Typography, Box, Button } from '@mui/material';
import { useGetAgents } from 'src/api/agent';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'notistack';
import { useGetLatestSubscription } from 'src/api/subscription';
import MarketplaceCard from '../marketplace-card';

export default function MarketplaceListView() {
  const { user, initialize } = useAuthContext();
  const { subscriptions } = useGetLatestSubscription();
  console.log('Latest subscriptions:', subscriptions);
  const { agents, agentsLoading, agentsError } = useGetAgents();

  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const agentsList = Array.isArray(agents) ? agents : agents?.data || [];

  const clinicSubscriptions = user?.clinic?.clinicSubscriptions || [];
  const activeSub = clinicSubscriptions.find((sub) => {
    const expiry = new Date(sub.expiryDate);
    return sub.status === 'success' && expiry > new Date();
  });

  const handleActionClick = async () => {
    if (!activeSub) {
      try {
        // 🔹 Example payload (you may decide which planId to attach for free trial)
        const payload = {
          clinicId: user.clinicId,
          planId: 1, // default free trial plan id
          bookingLimit: 50, // free trial booking limit
        };

        const res = await axiosInstance.post('/clinic-subscriptions/free-trial', payload);

        if (res.data.success) {
          enqueueSnackbar('Free trial started successfully!');
          initialize(); // refresh user data to reflect new subscription
        }
      } catch (err) {
        console.error('Free trial error:', err);
        enqueueSnackbar(typeof err === 'string' ? err : err.err.message, {
          variant: 'error',
        });
      }
    } else {
      // already has active sub → redirect to pricing page
      router.push(paths.dashboard.marketplace.pricing);
    }
  };

  let message = '';
  let buttonLabel = '';

  if (!activeSub) {
    message = 'You don’t have any active plan. You can use a 7-day free trial.';
    buttonLabel = 'Start Free Trial';
  } else {
    const remainingDays = Math.ceil(
      (new Date(subscriptions?.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    message = `Your current plan expires in ${remainingDays} day(s), and you have ${subscriptions?.remainingBookingLimit} remaining bookings. Please purchase a new plan to increase your booking limit.`;
    buttonLabel = 'Buy Plan';
  }

  if (agentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (agentsError) {
    return (
      <Typography color="error" align="center">
        Failed to load agents.
      </Typography>
    );
  }

  if (!agentsList.length) {
    return <Typography align="center">No agents available.</Typography>;
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="#f0f4f8"
        borderRadius={2}
        px={3}
        py={2}
        mb={3}
        gap={1}
      >
        <Typography variant="body1" color="text.primary">
          {message}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleActionClick}
          sx={{
            whiteSpace: 'nowrap', // ❌ Prevent text wrap
            flexShrink: 0, // 🚫 Don't shrink when space is tight
            height: 40, // (optional) Keep consistent height
            px: 3, // (optional) Add padding for balance
          }}
        >
          {buttonLabel}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {agentsList.map((agent) => (
          <Grid item xs={12} sm={6} md={3} key={agent.id}>
            <MarketplaceCard
              image={agent.thumbnail?.fileUrl || agent.fileUrl}
              name={agent.name}
              description={agent.description}
              features={agent.features}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

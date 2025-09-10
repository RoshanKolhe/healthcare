'use client';

import React from 'react';
import { Grid, CircularProgress, Typography, Box, Button } from '@mui/material';
import { useGetAgents } from 'src/api/agent';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import MarketplaceCard from '../marketplace-card';

export default function MarketplaceListView() {
  const { agents, agentsLoading, agentsError } = useGetAgents();
  const router = useRouter();

  const agentsList = Array.isArray(agents) ? agents : agents?.data || [];

  const handleFreeTrialClick = () => {
    router.push(paths.pricing);
  };

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
      >
        <Typography variant="body1" color="text.primary">
          {/* You can use a 7-day free trial. */}
          You dont have any agents yet. Please buy a plan to create your first agent.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleFreeTrialClick}>
          Buy Plan
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

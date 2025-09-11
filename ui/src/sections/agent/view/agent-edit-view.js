'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { Tab, Tabs } from '@mui/material';
import { useGetAgent } from 'src/api/agent';
import Iconify from 'src/components/iconify';
import { useCallback, useState } from 'react';
import AgentNewEditForm from '../agent-new-edit-form';

// ----------------------------------------------------------------------

export default function AgentEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { agent: currentAgent } = useGetAgent(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Agent',
            href: paths.dashboard.agent.list,
          },
          {
            name: currentAgent?.memberName || 'Agent Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AgentNewEditForm currentAgent={currentAgent} />
    </Container>
  );
}

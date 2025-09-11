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
import { useGetPlan } from 'src/api/plan';
import Iconify from 'src/components/iconify';
import { useCallback, useState } from 'react';
import PlanNewEditForm from '../plan-new-edit-form';

// ----------------------------------------------------------------------

export default function PlanEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { plan: currentPlan } = useGetPlan(id);

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
            name: 'Plan',
            href: paths.dashboard.plan.list,
          },
          {
            name: currentPlan?.memberName || 'Plan Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PlanNewEditForm currentPlan={currentPlan} />
    </Container>
  );
}

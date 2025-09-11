'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import PlanNewEditForm from '../plan-new-edit-form';

// ----------------------------------------------------------------------

export default function PlanCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Plan"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Plan',
            href: paths.dashboard.plan.list,
          },
          { name: 'New Plan' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PlanNewEditForm />
    </Container>
  );
}

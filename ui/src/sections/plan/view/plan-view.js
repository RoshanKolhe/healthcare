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
import { useGetPlan } from 'src/api/plan';
import PlanViewForm from '../plan-view-form';

// ----------------------------------------------------------------------

export default function PlanView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { plan: currentPlan } = useGetPlan(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View"
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
            name: `${currentPlan?.name}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PlanViewForm currentPlan={currentPlan} />
    </Container>
  );
}

'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ClinicServiceNewEditForm from '../clinic-service-new-edit-form';

// ----------------------------------------------------------------------

export default function ClinicServiceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Clinic Service"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Clinic Service',
            href: paths.dashboard.clinicService.list,
          },
          { name: 'New Clinic Service' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicServiceNewEditForm />
    </Container>
  );
}

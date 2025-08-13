'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ClinicNewEditForm from '../clinic-new-edit-form';

// ----------------------------------------------------------------------

export default function ClinicCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Clinic"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Clinic',
            href: paths.dashboard.clinic.list,
          },
          { name: 'New Clinic' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicNewEditForm />
    </Container>
  );
}

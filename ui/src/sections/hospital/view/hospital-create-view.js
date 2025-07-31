'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import HospitalNewEditForm from '../hospital-new-edit-form';

// ----------------------------------------------------------------------

export default function HospitalCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Hospital"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Hospital',
            href: paths.dashboard.hospital.list,
          },
          { name: 'New Hospital' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalNewEditForm />
    </Container>
  );
}

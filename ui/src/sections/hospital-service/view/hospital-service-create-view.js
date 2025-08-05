'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import HospitalServiceNewEditForm from '../hospital-service-new-edit-form';

// ----------------------------------------------------------------------

export default function HospitalServiceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new HospitalService"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'HospitalService',
            href: paths.dashboard.hospitalService.list,
          },
          { name: 'New HospitalService' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalServiceNewEditForm />
    </Container>
  );
}

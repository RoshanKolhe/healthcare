'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import HospitalTypeNewEditForm from '../hospital-type-new-edit-form';

// ----------------------------------------------------------------------

export default function HospitalTypeCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Hospital Type"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Hospital Type',
            href: paths.dashboard.hospitalType.list,
          },
          { name: 'New HospitalType' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalTypeNewEditForm />
    </Container>
  );
}

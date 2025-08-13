'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import DoctorNewEditForm from '../doctor-new-edit-form';

// ----------------------------------------------------------------------

export default function DoctorCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Doctor"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Doctor',
            href: paths.dashboard.doctor.list,
          },
          { name: 'New doctor' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DoctorNewEditForm />
    </Container>
  );
}

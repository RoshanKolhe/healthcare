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
import { useGetDoctor } from 'src/api/doctor';

import DoctorViewForm from '../doctor-view-form';

// ----------------------------------------------------------------------

export default function DoctorView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { doctor: currentDoctor } = useGetDoctor(id);

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
            name: 'Doctor',
            href: paths.dashboard.doctor.list,
          },
          {
            name: `${currentDoctor?.firstName} ${currentDoctor?.lastName ? currentDoctor?.lastName : ''}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DoctorViewForm currentDoctor={currentDoctor} />
    </Container>
  );
}

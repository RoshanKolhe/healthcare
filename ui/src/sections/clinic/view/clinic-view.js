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
import { useGetClinic } from 'src/api/clinic';

import ClinicViewForm from '../clinic-view-form';

// ----------------------------------------------------------------------

export default function ClinicView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { clinic: currentClinic } = useGetClinic(id);

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
            name: 'Clinic',
            href: paths.dashboard.clinic.list,
          },
          {
            name: `${currentClinic?.clinicName}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicViewForm currentClinic={currentClinic} />
    </Container>
  );
}

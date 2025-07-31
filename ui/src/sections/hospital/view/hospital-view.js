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
import { useGetHospital } from 'src/api/hospital';

import HospitalViewForm from '../hospital-view-form';

// ----------------------------------------------------------------------

export default function HospitalView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { hospital: currentHospital } = useGetHospital(id);

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
            name: 'Hospital',
            href: paths.dashboard.hospital.list,
          },
          {
            name: `${currentHospital?.hospitalName}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalViewForm currentHospital={currentHospital} />
    </Container>
  );
}

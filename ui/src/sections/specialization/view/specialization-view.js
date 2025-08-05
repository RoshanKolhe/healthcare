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
import { useGetSpecialization, useGetSpecializations } from 'src/api/specializations';

import SpecializationViewForm from '../specialization-view-form';

// ----------------------------------------------------------------------

export default function SpecializationView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { specialization: currentSpecialization } = useGetSpecialization(id);

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
            name: 'Specialization',
            href: paths.dashboard.specialization.list,
          },
          {
            name: `${currentSpecialization?.specialization}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <SpecializationViewForm currentSpecialization={currentSpecialization} />
    </Container>
  );
}

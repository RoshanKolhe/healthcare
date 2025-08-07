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

import { useGetClinicType } from 'src/api/clinic-type';
import ClinicTypeViewForm from '../clinic-type-view-form';

// ----------------------------------------------------------------------

export default function ClinicTypeView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { clinicType: currentClinicType } = useGetClinicType(id);

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
            name: 'Clinic Type',
            href: paths.dashboard.clinicType.list,
          },
          {
            name: `${currentClinicType?.clinicType}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicTypeViewForm currentClinicType={currentClinicType} />
    </Container>
  );
}

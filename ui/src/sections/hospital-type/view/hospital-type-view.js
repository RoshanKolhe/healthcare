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

import { useGetHospitalType } from 'src/api/hospital-type';
import HospitalTypeViewForm from '../hospital-type-view-form';

// ----------------------------------------------------------------------

export default function HospitalTypeView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { hospitalType: currentHospitalType } = useGetHospitalType(id);

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
            name: 'HospitalType',
            href: paths.dashboard.hospitalType.list,
          },
          {
            name: `${currentHospitalType?.hospitalType}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalTypeViewForm currentHospitalType={currentHospitalType} />
    </Container>
  );
}

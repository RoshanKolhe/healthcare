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

import { useGetHospitalService } from 'src/api/hospital-service';
import HospitalServiceViewForm from '../hospital-service-view-form';

// ----------------------------------------------------------------------

export default function HospitalServiceView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { hospitalService: currentHospitalService } = useGetHospitalService(id);

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
            name: 'HospitalService',
            href: paths.dashboard.hospitalService.list,
          },
          {
            name: `${currentHospitalService?.hospitalService}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalServiceViewForm currentHospitalService={currentHospitalService} />
    </Container>
  );
}

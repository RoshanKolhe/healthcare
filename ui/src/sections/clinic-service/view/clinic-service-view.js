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

import { useGetClinicService } from 'src/api/clinic-service';
import ClinicServiceViewForm from '../clinic-service-view-form';

// ----------------------------------------------------------------------

export default function ClinicServiceView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { clinicService: currentClinicService } = useGetClinicService(id);

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
            name: 'Clinic Service',
            href: paths.dashboard.clinicService.list,
          },
          {
            name: `${currentClinicService?.clinicService}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicServiceViewForm currentClinicService={currentClinicService} />
    </Container>
  );
}

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
import ClinicServiceNewEditForm from '../clinic-service-new-edit-form';

// ----------------------------------------------------------------------

export default function ClinicServiceEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { clinicService: currentClinicService } = useGetClinicService(id);
  console.log('currentClinicService', currentClinicService);

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
            name: 'Clinic Service',
            href: paths.dashboard.clinicService.list,
          },
          {
            name: currentClinicService?.clinicService || 'ClinicService Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicServiceNewEditForm currentClinicService={currentClinicService} />
    </Container>
  );
}

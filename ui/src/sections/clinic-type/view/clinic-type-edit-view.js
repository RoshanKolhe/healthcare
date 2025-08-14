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
import ClinicTypeNewEditForm from '../clinic-type-new-edit-form';

// ----------------------------------------------------------------------

export default function ClinicTypeEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { clinicType: currentClinicType } = useGetClinicType(id);
  console.log('currentClinicType', currentClinicType);

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
            name: 'Clinic Type',
            href: paths.dashboard.clinicType.list,
          },
          {
            name: currentClinicType?.clinicType || 'Clinic Type Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicTypeNewEditForm currentClinicType={currentClinicType} />
    </Container>
  );
}

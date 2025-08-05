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
import HospitalTypeNewEditForm from '../hospital-type-new-edit-form';

// ----------------------------------------------------------------------

export default function HospitalTypeEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { hospitaltype: currentHospitalType } = useGetHospitalType(id);
  console.log('currentHospitalType', currentHospitalType);

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
            name: 'Hospital Type',
            href: paths.dashboard.hospitalType.list,
          },
          {
            name: currentHospitalType?.hospitalType || 'Hospital Type Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalTypeNewEditForm currentHospitalType={currentHospitalType} />
    </Container>
  );
}

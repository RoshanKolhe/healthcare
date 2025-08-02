'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { _userList } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetDoctor } from 'src/api/doctor';
import DoctorNewEditForm from '../doctor-new-edit-form';

// ----------------------------------------------------------------------

export default function DoctorEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  // const currentDoctor = _userList.find((user) => user.id === id);
  const { doctor: currentDoctor } = useGetDoctor(id);

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
            name: 'Doctor',
            href: paths.dashboard.doctor.list,
          },
          { name: currentDoctor?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DoctorNewEditForm currentDoctor={currentDoctor} />
    </Container>
  );
}

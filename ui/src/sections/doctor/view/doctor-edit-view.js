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
import { useCallback, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import Iconify from 'src/components/iconify';
import DoctorNewEditForm from '../doctor-new-edit-form';
import DoctorAccountChangePassword from '../doctor-account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
];

export default function DoctorEditView() {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

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

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <DoctorNewEditForm currentDoctor={currentDoctor} />}

      {currentTab === 'security' && <DoctorAccountChangePassword currentDoctor={currentDoctor} />}

      {/* <DoctorNewEditForm currentDoctor={currentDoctor} /> */}
    </Container>
  );
}

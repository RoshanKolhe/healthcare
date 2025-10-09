'use client';

import { useState, useCallback, useEffect } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import AccountGeneral from '../account-general';
import AccountBilling from '../account-billing';
import AccountChangePassword from '../account-change-password';
import BranchWhatsappEditForm from '../branch-account-whatsapp-detail';

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext();

  const [ user , setUser ] = useState(null);

  const [id, setId] = useState(null);
  const userRole = user?.permissions?.[0];

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleMe = async()=>{
    try{
      const response = await axiosInstance.get('/me');
      if(response.data){
        setUser(response.data);
        setId(response.data?.branch?.branchWhatsapp?.id);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const TABS = [
    {
      value: 'general',
      label: 'General',
      icon: <Iconify icon="solar:user-id-bold" width={24} />,
    },
    ...(userRole === 'clinic'
      ? [
          {
            value: 'billing',
            label: 'Billing',
            icon: <Iconify icon="solar:bill-list-bold" width={24} />,
          },
        ]
      : []),
    {
      value: 'security',
      label: 'Security',
      icon: <Iconify icon="ic:round-vpn-key" width={24} />,
    },
    ...(userRole === 'branch'
      ? [
          {
            value: 'whatsapp',
            label: 'Whatsapp detail',
            icon: <Iconify icon="logos:whatsapp-icon" width={24} />,
          },
        ]
      : []),
  ];

  useEffect(()=>{
    handleMe();
  },[]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'Account' },
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

      {currentTab === 'general' && <AccountGeneral />}

      {currentTab === 'billing' && userRole === 'clinic' && (
        <AccountBilling />
      )}

      {/* {currentTab === 'notifications' && <AccountNotifications />}

      {currentTab === 'social' && <AccountSocialLinks socialLinks={_userAbout.socialLinks} />} */}

      {currentTab === 'security' && <AccountChangePassword />}

      {currentTab === 'whatsapp' && userRole === 'branch' && (
        <BranchWhatsappEditForm
          id={id}
          setId={setId}
        />
      )}
    </Container>
  );
}

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
import { Tab, Tabs } from '@mui/material';
import { useGetHospital } from 'src/api/hospital';
import Iconify from 'src/components/iconify';
import { useCallback, useState } from 'react';
import HospitalNewEditForm from '../hospital-new-edit-form';

// ----------------------------------------------------------------------

export default function HospitalEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { hospital: currentHospital } = useGetHospital(id);

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
            name: 'Hospital',
            href: paths.dashboard.hospital.list,
          },
          {
            name: currentHospital?.memberName || 'Hospital Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HospitalNewEditForm currentHospital={currentHospital} />
    </Container>
  );
}

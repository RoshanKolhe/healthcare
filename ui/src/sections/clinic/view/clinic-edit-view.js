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
import { useGetClinic } from 'src/api/clinic';
import Iconify from 'src/components/iconify';
import { useCallback, useState } from 'react';
import ClinicNewEditForm from '../clinic-new-edit-form';

// ----------------------------------------------------------------------

export default function ClinicEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { clinic: currentClinic } = useGetClinic(id);

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
            name: 'Clinic',
            href: paths.dashboard.clinic.list,
          },
          {
            name: currentClinic?.memberName || 'Clinic Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClinicNewEditForm currentClinic={currentClinic} isEditForm />
    </Container>
  );
}

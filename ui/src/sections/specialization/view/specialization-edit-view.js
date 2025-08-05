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
import { useGetSpecialization, useGetSpecializations } from 'src/api/specializations';
import { Tab, Tabs } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useCallback, useState } from 'react';
import SpecializationNewEditForm from '../specialization-new-edit-form';

// ----------------------------------------------------------------------

export default function SpecializationEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { specialization: currentSpecialization } = useGetSpecialization(id);
  console.log('currentSpecialization', currentSpecialization);

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
            name: 'Specialization',
            href: paths.dashboard.specialization.list,
          },
          {
            name: currentSpecialization?.specialization || 'Specialization Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <SpecializationNewEditForm currentSpecialization={currentSpecialization} />
    </Container>
  );
}

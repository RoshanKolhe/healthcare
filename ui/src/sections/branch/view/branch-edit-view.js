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
import { useGetBranch } from 'src/api/branch';
import Iconify from 'src/components/iconify';
import { useCallback, useState } from 'react';
import BranchNewEditForm from '../branch-new-edit-form';

// ----------------------------------------------------------------------

export default function BranchEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { branch: currentBranch } = useGetBranch(id);

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
            name: 'Branch',
            href: paths.dashboard.branch.list,
          },
          {
            name: currentBranch?.memberName || 'Branch Detail',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BranchNewEditForm currentBranch={currentBranch} />
    </Container>
  );
}

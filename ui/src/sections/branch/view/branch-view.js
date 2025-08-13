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
import { useGetBranch } from 'src/api/branch';

import BranchViewForm from '../branch-view-form';

// ----------------------------------------------------------------------

export default function BranchView() {
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
            name: `${currentBranch?.name}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BranchViewForm currentBranch={currentBranch} />
    </Container>
  );
}

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
import { useGetAgent } from 'src/api/agent';
import AgentViewForm from '../agent-view-form';

// ----------------------------------------------------------------------

export default function AgentView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { agent: currentAgent } = useGetAgent(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Agent',
            href: paths.dashboard.agent.list,
          },
          {
            name: `${currentAgent?.name}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AgentViewForm currentAgent={currentAgent} />
    </Container>
  );
}

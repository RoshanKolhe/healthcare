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
import { useGetCategory } from 'src/api/categorys';

import CategoryViewForm from '../category-view-form';

// ----------------------------------------------------------------------

export default function CategoryView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { category: currentCategory } = useGetCategory(id);

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
            name: 'Category',
            href: paths.dashboard.category.list,
          },
          {
            name: `${currentCategory?.category}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CategoryViewForm currentCategory={currentCategory} />
    </Container>
  );
}

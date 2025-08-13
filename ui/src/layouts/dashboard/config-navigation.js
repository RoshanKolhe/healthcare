import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  clinic: icon('ic_clinic'),
  branch: icon('ic_branch'),
  doctor: icon('ic_doctor'),
  service: icon('ic_services'),
  type: icon('ic_type'),
  category: icon('ic_category'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
  const { user } = useAuthContext();

  let data = [];
  if (user && (user.permissions.includes('super_admin'))) {
    data = [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [{ title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard }],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // USER
          {
            title: t('user'),
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: t('list'), path: paths.dashboard.user.list },
              { title: t('create'), path: paths.dashboard.user.new },
            ],
          },
          {
            title: t('clinic'),
            path: paths.dashboard.clinic.root,
            icon: ICONS.clinic,
            children: [
              { title: t('list'), path: paths.dashboard.clinic.list },
              { title: t('create'), path: paths.dashboard.clinic.new },
            ],
          },
          {
            title: t('branch'),
            path: paths.dashboard.branch.root,
            icon: ICONS.branch,
            children: [
              { title: t('list'), path: paths.dashboard.branch.list },
              { title: t('create'), path: paths.dashboard.branch.new },
            ],
          },
          {
            title: t('doctor'),
            path: paths.dashboard.doctor.root,
            icon: ICONS.doctor,
            children: [
              { title: t('list'), path: paths.dashboard.doctor.list },
              { title: t('create'), path: paths.dashboard.doctor.new },
            ],
          },
        ],
      },
      // MASTERS
      {
        subheader: t('masters'),
        items: [
          // Department
          {
            title: t('specializations'),
            path: paths.dashboard.specialization.root,
            icon: ICONS.label,
            // roles: [ 'doctor'],
            children: [
              {
                title: t('list'),
                path: paths.dashboard.specialization.list,
                // roles: [ 'doctor'],
              },
              {
                title: t('create'),
                path: paths.dashboard.specialization.new,
                // roles: ['doctor'],
              },
            ],
          },
          {
            title: t('category'),
            path: paths.dashboard.category.root,
            icon: ICONS.category,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.category.list,
              },
              {
                title: t('create'),
                path: paths.dashboard.category.new,
              },
            ],
          },
          {
            title: t('clinic type'),
            path: paths.dashboard.clinicType.root,
            icon: ICONS.type,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.clinicType.list,
              },
              {
                title: t('create'),
                path: paths.dashboard.clinicType.new,
              },
            ],
          },
          {
            title: t('clinic service'),
            path: paths.dashboard.clinicService.root,
            icon: ICONS.service,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.clinicService.list,
              },
              {
                title: t('create'),
                path: paths.dashboard.clinicService.new,
              },
            ],
          },
        ],
      },
    ];
  }
  if (user && user.permissions.includes('clinic')) {
    data = [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [{ title: t('dashboard'), path: paths.dashboard.root, icon: ICONS.dashboard }],
      },
      // CLINIC DASHBOARD
      {
        subheader: t('management'),
        items: [
          {
            title: t('clinic'),
            path: paths.dashboard.clinic.root,
            icon: ICONS.clinic,
            children: [
              { title: t('list'), path: paths.dashboard.clinic.list },
              { title: t('create'), path: paths.dashboard.clinic.new },
            ],
          },
          {
            title: t('branch'),
            path: paths.dashboard.branch.root,
            icon: ICONS.branch,
            children: [
              { title: t('list'), path: paths.dashboard.branch.list },
              { title: t('create'), path: paths.dashboard.branch.new },
            ],
          },
          {
            title: t('doctor'),
            path: paths.dashboard.doctor.root,
            icon: ICONS.doctor,
            children: [
              { title: t('list'), path: paths.dashboard.doctor.list },
              { title: t('create'), path: paths.dashboard.doctor.new },
            ],
          },
        ],
      },
    ];
  }
  if (user && user.permissions.includes('doctor')) {
    data = [
      {
        subheader: t('management'),
        items: [
          {
            title: t('doctor'),
            path: paths.dashboard.doctor.root,
            icon: ICONS.doctor,
            children: [
              { title: t('list'), path: paths.dashboard.doctor.list },
              { title: t('create'), path: paths.dashboard.doctor.new },
            ],
          },
        ],
      },
    ];
  }

  return data;
}

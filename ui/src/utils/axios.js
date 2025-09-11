import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    clinic: {
      me: '/me',
      login: '/login',
    },
    branch: {
      me: '/me',
      login: '/login',
    },
    doctor: {
      me: '/doctors/me',
      login: '/doctors-login',
      register: '/doctors-register',
    },
    me: '/me',
    login: '/login',
    register: '/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  user: {
    list: '/users/list',
    filterList: (filter) => `/users/list?${filter}`,
    details: (id) => `/users/${id}`,
  },
  doctor: {
    list: '/doctors/list',
    filterList: (filter) => `/doctors/list?${filter}`,
    details: (id) => `/doctors/${id}`,
  },
  doctorAvailability: {
    list: (id) => `/doctor-availabilities/${id}`,
    details: (id) => `/doctor-availabilities/${id}`,
    filterList: (filter) => `/doctor-availabilities?${filter}`,
  },
  booking: {
    list: '/patient-bookings',
    details: (id) => `/patient-bookings/${id}`,
  },
  clinic: {
    list: '/clinics',
    details: (id) => `/clinics/${id}`,
    filterList: (filter) => `/clinics?${filter}`,
    search: '/api/clinics/search',
  },
  agent: {
    list: '/agents',
    details: (id) => `/agents/${id}`,
    filterList: (filter) => `/agents?${filter}`,
  },
  branch: {
    list: '/branches',
    details: (id) => `/branches/${id}`,
    filterList: (filter) => `/branches?${filter}`,
    search: '/api/branches/search',
  },
  specialization: {
    list: '/specializations',
    details: (id) => `/specializations/${id}`,
    filterList: (filter) => `/specializations?${filter}`,
  },
  category: {
    list: '/categories',
    details: (id) => `/categories/${id}`,
    filterList: (filter) => `/categories?filter=${filter}`,
  },
  clinicType: {
    list: '/clinic-types',
    details: (id) => `/clinic-types/${id}`,
    filterList: (filter) => `/clinic-types?${filter}`,
  },
  clinicService: {
    list: '/clinic-services',
    details: (id) => `/clinic-services/${id}`,
    filterList: (filter) => `/clinic-services?${filter}`,
  },
};

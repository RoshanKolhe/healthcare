// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetDoctors() {
  const URL = endpoints.doctor.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDoctors = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    doctors: data || [],
    doctorsLoading: isLoading,
    doctorsError: error,
    doctorsValidating: isValidating,
    doctorsEmpty: !isLoading && !data?.length,
    refreshDoctors, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetNotifications(filter) {
  let URL;
  if (filter) {
    URL = endpoints.doctor.filterNotificationList(filter);
  } else {
    URL = endpoints.doctor.notifications;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshNotifications = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    notifications: data || [],
    notificationsLoading: isLoading,
    notificationsError: error,
    notificationsValidating: isValidating,
    notificationsEmpty: !isLoading && !data?.length,
    refreshNotifications, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetDoctor(doctorId) {
  const URL = doctorId ? [endpoints.doctor.details(doctorId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      doctor: data,
      doctorLoading: isLoading,
      doctorError: error,
      doctorValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetDoctorsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.doctor.filterList(filter);
  } else {
    URL = endpoints.doctor.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterDoctors = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredDoctors: data || [],
    filteredDoctorsLoading: isLoading,
    filteredDoctorsError: error,
    filteredDoctorsValidating: isValidating,
    filteredDoctorsEmpty: !isLoading && !data?.length,
    refreshFilterDoctors, // Include the refresh function separately
  };
}

export function useGetDashboradSummary(filter) {
  let URL;
  if (filter) {
    URL = endpoints.doctor.getFilteredDashboradSummary(filter);
  } else {
    URL = endpoints.doctor.getDashboradSummary;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDashboardCounts = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    dashboardCounts: data || [],
    isLoading,
    error,
    isValidating,
    refreshDashboardCounts,
  };
}

export function useGetDashboradChartData(filter) {
  let URL;
  if (filter) {
    URL = endpoints.doctor.getFilteredChartData(filter);
  } else {
    URL = endpoints.doctor.getChartData;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDashboradChartData = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    dashboradChartData: data || [],
    isLoading,
    error,
    isValidating,
    refreshDashboradChartData,
  };
}

export function useGetDashboradConductionsData(filter) {
  let URL;
  if (filter) {
    URL = endpoints.doctor.getFilteredConductionsData(filter);
  } else {
    URL = endpoints.doctor.getConductionsData;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDashboradConductionsData = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    dashboradConductionsData: data || [],
    isLoading,
    error,
    isValidating,
    refreshDashboradConductionsData,
  };
}

export function useGetDashboradForecastingData(filter) {
  const URL = endpoints.doctor.getForecastingData(filter);

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDashboradChartData = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    dashboradChartData: data || [],
    isLoading,
    error,
    isValidating,
    refreshDashboradChartData,
  };
}

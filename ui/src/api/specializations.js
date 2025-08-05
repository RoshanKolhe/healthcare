// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetSpecializations() {
  const URL = endpoints.specialization.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshSpecializations = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    specializations: data || [],
    specializationsLoading: isLoading,
    specializationsError: error,
    specializationsValidating: isValidating,
    specializationsEmpty: !isLoading && !data?.length,
    refreshSpecializations, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetNotifications(filter) {
  let URL;
  if (filter) {
    URL = endpoints.specialization.filterNotificationList(filter);
  } else {
    URL = endpoints.specialization.notifications;
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

export function useGetSpecialization(specializationId) {
  const URL = specializationId ? endpoints.specialization.details(specializationId) : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      specialization: data,
      specializationLoading: isLoading,
      specializationError: error,
      specializationValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetSpecializationsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.specialization.filterList(filter);
  } else {
    URL = endpoints.specialization.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterSpecializations = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredSpecializations: data || [],
    filteredSpecializationsLoading: isLoading,
    filteredSpecializationsError: error,
    filteredSpecializationsValidating: isValidating,
    filteredSpecializationsEmpty: !isLoading && !data?.length,
    refreshFilterSpecializations, // Include the refresh function separately
  };
}

export function useGetDashboradSummary(filter) {
  let URL;
  if (filter) {
    URL = endpoints.specialization.getFilteredDashboradSummary(filter);
  } else {
    URL = endpoints.specialization.getDashboradSummary;
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
    URL = endpoints.specialization.getFilteredChartData(filter);
  } else {
    URL = endpoints.specialization.getChartData;
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
    URL = endpoints.specialization.getFilteredConductionsData(filter);
  } else {
    URL = endpoints.specialization.getConductionsData;
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
  const URL = endpoints.specialization.getForecastingData(filter);

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

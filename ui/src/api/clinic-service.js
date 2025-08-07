// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetClinicServices() {
  const URL = endpoints.clinicService.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshClinicServices = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    clinicServices: data || [],
    clinicServicesLoading: isLoading,
    clinicServicesError: error,
    clinicServicesValidating: isValidating,
    clinicServicesEmpty: !isLoading && !data?.length,
    refreshClinicServices, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetClinicService(clinicServiceId) {
  const URL = clinicServiceId ? [endpoints.clinicService.details(clinicServiceId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      clinicService: data,
      clinicServiceLoading: isLoading,
      clinicServiceError: error,
      clinicServiceValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetClinicServicesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.clinicService.filterList(filter);
  } else {
    URL = endpoints.clinicService.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterClinicServices = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredClinicServices: data || [],
    filteredClinicServicesLoading: isLoading,
    filteredClinicServicesError: error,
    filteredClinicServicesValidating: isValidating,
    filteredClinicServicesEmpty: !isLoading && !data?.length,
    refreshFilterClinicServices, // Include the refresh function separately
  };
}

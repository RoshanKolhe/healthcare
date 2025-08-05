// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetHospitalServices() {
  const URL = endpoints.hospitalService.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshHospitalServices = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    hospitalServices: data || [],
    hospitalServicesLoading: isLoading,
    hospitalServicesError: error,
    hospitalServicesValidating: isValidating,
    hospitalServicesEmpty: !isLoading && !data?.length,
    refreshHospitalServices, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetHospitalService(hospitalServiceId) {
  const URL = hospitalServiceId ? [endpoints.hospitalService.details(hospitalServiceId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      hospitalService: data,
      hospitalServiceLoading: isLoading,
      hospitalServiceError: error,
      hospitalServiceValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetHospitalServicesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.hospitalService.filterList(filter);
  } else {
    URL = endpoints.hospitalService.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterHospitalServices = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredHospitalServices: data || [],
    filteredHospitalServicesLoading: isLoading,
    filteredHospitalServicesError: error,
    filteredHospitalServicesValidating: isValidating,
    filteredHospitalServicesEmpty: !isLoading && !data?.length,
    refreshFilterHospitalServices, // Include the refresh function separately
  };
}

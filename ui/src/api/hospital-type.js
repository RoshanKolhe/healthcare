// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetHospitalTypes() {
  const URL = endpoints.hospitalType.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshHospitalTypes = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    hospitalTypes: data || [],
    hospitalTypesLoading: isLoading,
    hospitalTypesError: error,
    hospitalTypesValidating: isValidating,
    hospitalTypesEmpty: !isLoading && !data?.length,
    refreshHospitalTypes, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetHospitalType(hospitalTypeId) {
  const URL = hospitalTypeId ? [endpoints.hospitalType.details(hospitalTypeId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      hospitalType: data,
      hospitalTypeLoading: isLoading,
      hospitalTypeError: error,
      hospitalTypeValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetHospitalTypesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.hospitalType.filterList(filter);
  } else {
    URL = endpoints.hospitalType.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterHospitalTypes = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredHospitalTypes: data || [],
    filteredHospitalTypesLoading: isLoading,
    filteredHospitalTypesError: error,
    filteredHospitalTypesValidating: isValidating,
    filteredHospitalTypesEmpty: !isLoading && !data?.length,
    refreshFilterHospitalTypes, // Include the refresh function separately
  };
}

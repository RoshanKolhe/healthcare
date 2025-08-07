// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetClinicTypes() {
  const URL = endpoints.clinicType.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshClinicTypes = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    clinicTypes: data || [],
    clinicTypesLoading: isLoading,
    clinicTypesError: error,
    clinicTypesValidating: isValidating,
    clinicTypesEmpty: !isLoading && !data?.length,
    refreshClinicTypes, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetClinicType(clinicTypeId) {
  const URL = clinicTypeId ? [endpoints.clinicType.details(clinicTypeId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      clinicType: data,
      clinicTypeLoading: isLoading,
      clinicTypeError: error,
      clinicTypeValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetClinicTypesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.clinicType.filterList(filter);
  } else {
    URL = endpoints.clinicType.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterClinicTypes = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredClinicTypes: data || [],
    filteredClinicTypesLoading: isLoading,
    filteredClinicTypesError: error,
    filteredClinicTypesValidating: isValidating,
    filteredClinicTypesEmpty: !isLoading && !data?.length,
    refreshFilterClinicTypes, // Include the refresh function separately
  };
}

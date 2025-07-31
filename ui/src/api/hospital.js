import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetHospitals() {
  const URL = endpoints.hospital.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshHospitals = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };
  return{
    hospitals: Array.isArray(data) ? data : [],
      hospitalsLoading: isLoading,
      hospitalsError: error,
      hospitalsValidating: isValidating,
      hospitalsEmpty: !isLoading && !data?.hospitals?.length,
      refreshHospitals,
  };
}

// ----------------------------------------------------------------------

export function useGetHospital(hospitalId) {
  const URL = hospitalId ? [endpoints.hospital.details(hospitalId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      hospital: data,
      hospitalLoading: isLoading,
      hospitalError: error,
      hospitalValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
// ----------------------------------------------------------------------

export function useGetHospitalsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.hospital.filterList(filter);
  } else {
    URL = endpoints.hospital.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterhospitals = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredhospitals: data || [],
    filteredhospitalsLoading: isLoading,
    filteredhospitalsError: error,
    filteredhospitalsValidating: isValidating,
    filteredhospitalsEmpty: !isLoading && !data?.length,
    refreshFilterhospitals, // Include the refresh function separately
  };
}
// ----------------------------------------------------------------------

export function useSearchHospitals(query) {
  const URL = query ? [endpoints.hospital.search, { params: { query } }] : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}

import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetClinics() {
  const URL = endpoints.clinic.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshClinics = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };
  return{
    clinics: Array.isArray(data) ? data : [],
      clinicsLoading: isLoading,
      clinicsError: error,
      clinicsValidating: isValidating,
      clinicsEmpty: !isLoading && !data?.clinics?.length,
      refreshClinics,
  };
}

// ----------------------------------------------------------------------

export function useGetClinic(clinicId) {
  const URL = clinicId ? [endpoints.clinic.details(clinicId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      clinic: data,
      clinicLoading: isLoading,
      clinicError: error,
      clinicValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
// ----------------------------------------------------------------------

export function useGetClinicsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.clinic.filterList(filter);
  } else {
    URL = endpoints.clinic.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterclinics = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredclinics: data || [],
    filteredclinicsLoading: isLoading,
    filteredclinicsError: error,
    filteredclinicsValidating: isValidating,
    filteredclinicsEmpty: !isLoading && !data?.length,
    refreshFilterclinics, // Include the refresh function separately
  };
}
// ----------------------------------------------------------------------

export function useSearchClinics(query) {
  const URL = query ? [endpoints.clinic.search, { params: { query } }] : null;

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

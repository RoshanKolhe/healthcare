import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBranchs() {
  const URL = endpoints.branch.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      branchs: Array.isArray(data) ? data : [],
      branchsLoading: isLoading,
      branchsError: error,
      branchsValidating: isValidating,
      branchsEmpty: !isLoading && !data?.branchs?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetBranch(branchId) {
  const URL = branchId ? [endpoints.branch.details(branchId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      branch: data,
      branchLoading: isLoading,
      branchError: error,
      branchValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetBranchesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.branch.filterList(filter);
  } else {
    URL = endpoints.branch.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterbranches = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredbranches: data || [],
    filteredbranchesLoading: isLoading,
    filteredbranchesError: error,
    filteredbranchesValidating: isValidating,
    filteredbranchesEmpty: !isLoading && !data?.length,
    refreshFilterbranches, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------


export function useSearchBranchs(query) {
  const URL = query ? [endpoints.branch.search, { params: { query } }] : null;

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

// ----------------------------------------------------------------------

export function useGetBranchesByHospitalId(hospitalId) {
  const filter = hospitalId
    ? `filter=${encodeURIComponent(JSON.stringify({ where: { hospitalId, isActive: true } }))}`
    : null;

  const URL = filter ? endpoints.branch.filterList(filter) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  return {
    branches: data || [],
    branchesLoading: isLoading,
    branchesError: error,
    branchesValidating: isValidating,
  };
}
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetPlans() {
  const URL = endpoints.plan.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      plans: Array.isArray(data) ? data : [],
      plansLoading: isLoading,
      plansError: error,
      plansValidating: isValidating,
      plansEmpty: !isLoading && !data?.plans?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetPlan(planId) {
  const URL = planId ? [endpoints.plan.details(planId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      plan: data,
      planLoading: isLoading,
      planError: error,
      planValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetPlansWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.plan.filterList(filter);
  } else {
    URL = endpoints.plan.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterplanes = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredplanes: data || [],
    filteredplanesLoading: isLoading,
    filteredplanesError: error,
    filteredplanesValidating: isValidating,
    filteredplanesEmpty: !isLoading && !data?.length,
    refreshFilterplanes, // Include the refresh function separately
  };
}

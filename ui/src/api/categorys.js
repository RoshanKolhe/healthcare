// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCategorys() {
  const URL = endpoints.category.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshCategorys = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    categorys: data || [],
    categorysLoading: isLoading,
    categorysError: error,
    categorysValidating: isValidating,
    categorysEmpty: !isLoading && !data?.length,
    refreshCategorys, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetCategory(categoryId) {
  const URL = categoryId ? [endpoints.category.details(categoryId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      category: data,
      categoryLoading: isLoading,
      categoryError: error,
      categoryValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetCategorysWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.category.filterList(filter);
  } else {
    URL = endpoints.category.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterCategorys = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredCategorys: data || [],
    filteredCategorysLoading: isLoading,
    filteredCategorysError: error,
    filteredCategorysValidating: isValidating,
    filteredCategorysEmpty: !isLoading && !data?.length,
    refreshFilterCategorys, // Include the refresh function separately
  };
}


// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

export function useGetSubscriptions() {
  const URL = endpoints.subscription.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshSubscriptions = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    subscriptions: data || [],
    subscriptionsLoading: isLoading,
    subscriptionsError: error,
    subscriptionsValidating: isValidating,
    subscriptionsEmpty: !isLoading && !data?.length,
    refreshSubscriptions, // Include the refresh function separately
  };
}

export function useGetSubscription(subscriptionId) {
  const URL = subscriptionId ? [endpoints.subscription.details(subscriptionId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      subscription: data,
      subscriptionLoading: isLoading,
      subscriptionError: error,
      subscriptionValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
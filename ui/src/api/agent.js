import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetAgents() {
  const URL = endpoints.agent.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      agents: Array.isArray(data) ? data : [],
      agentsLoading: isLoading,
      agentsError: error,
      agentsValidating: isValidating,
      agentsEmpty: !isLoading && !data?.agents?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetAgent(agentId) {
  const URL = agentId ? [endpoints.agent.details(agentId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      agent: data,
      agentLoading: isLoading,
      agentError: error,
      agentValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetAgentsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.agent.filterList(filter);
  } else {
    URL = endpoints.agent.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilteragentes = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredagentes: data || [],
    filteredagentesLoading: isLoading,
    filteredagentesError: error,
    filteredagentesValidating: isValidating,
    filteredagentesEmpty: !isLoading && !data?.length,
    refreshFilteragentes, // Include the refresh function separately
  };
}

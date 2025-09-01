import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';
import axios from 'axios';

// ----------------------------------------------------------------------

export function useGetDoctorAvailabilities(doctorId) {
  const id = doctorId?.id ?? doctorId;

  const URL = id ? endpoints.doctorAvailability.list(id) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDoctorAvailabilities = () => {
    mutate();
  };

  return {
    doctorAvailabilities: Array.isArray(data) ? data : [],
    doctorAvailabilitiesLoading: isLoading,
    doctorAvailabilitiesError: error,
    doctorAvailabilitiesValidating: isValidating,
    doctorAvailabilitiesEmpty: !isLoading && !data?.length,
    refreshDoctorAvailabilities,
  };
}

// ----------------------------------------------------------------------

export function useGetDoctorAvailability(availabilityId) {
  const URL = availabilityId ? [endpoints.doctorAvailability.details(availabilityId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      doctorAvailability: data,
      doctorAvailabilityLoading: isLoading,
      doctorAvailabilityError: error,
      doctorAvailabilityValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetDoctorAvailabilitiesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.doctorAvailability.filterList(filter);
  } else {
    URL = endpoints.doctorAvailability.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterDoctorAvailabilities = () => {
    mutate();
  };

  return {
    filteredDoctorAvailabilities: data || [],
    filteredDoctorAvailabilitiesLoading: isLoading,
    filteredDoctorAvailabilitiesError: error,
    filteredDoctorAvailabilitiesValidating: isValidating,
    filteredDoctorAvailabilitiesEmpty: !isLoading && !data?.length,
    refreshFilterDoctorAvailabilities,
  };
}

// ----------------------------------------------------------------------

export function useSearchDoctorAvailabilities(query) {
  const URL = query ? [endpoints.doctorAvailability.search, { params: { query } }] : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results?.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}



export async function createDoctorAvailability(data) {
  const response = await axios.post(endpoints.doctorAvailability.list, data);
  return response.data;
}

export async function updateDoctorAvailability(id, data) {
  const response = await axios.patch(endpoints.doctorAvailability.details(id), data);
  return response.data;
}

export async function deleteDoctorAvailability(id) {
  const response = await axios.delete(endpoints.doctorAvailability.details(id));
  return response.data;
}
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetBookings() {
  const URL = endpoints.booking.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      bookings: Array.isArray(data) ? data : [],
      bookingsLoading: isLoading,
      bookingsError: error,
      bookingsValidating: isValidating,
      bookingsEmpty: !isLoading && !data?.bookings?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetBooking(bookingId) {
  const URL = bookingId ? [endpoints.booking.details(bookingId)] : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshBooking = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
      booking: data,
      bookingLoading: isLoading,
      bookingError: error,
      bookingValidating: isValidating,
      refreshBooking, 
    };
}

// ----------------------------------------------------------------------

export function useGetBookingesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.booking.filterList(filter);
  } else {
    URL = endpoints.booking.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterbookinges = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredbookinges: data || [],
    filteredbookingesLoading: isLoading,
    filteredbookingesError: error,
    filteredbookingesValidating: isValidating,
    filteredbookingesEmpty: !isLoading && !data?.length,
    refreshFilterbookinges, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------


export function useSearchBookings(query) {
  const URL = query ? [endpoints.booking.search, { params: { query } }] : null;

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

export function useGetBookingesByClinicId(clinicId) {
  const filter = clinicId
    ? `filter=${encodeURIComponent(JSON.stringify({ where: { clinicId, isActive: true } }))}`
    : null;

  const URL = filter ? endpoints.booking.filterList(filter) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  return {
    bookinges: data || [],
    bookingesLoading: isLoading,
    bookingesError: error,
    bookingesValidating: isValidating,
  };
}
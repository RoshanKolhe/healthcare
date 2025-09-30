import useSWR from 'swr';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

export function useGetWhatsappDetail(whatsappDetailId) {
  const URL = whatsappDetailId ? [endpoints.whastappDetail.details(whatsappDetailId)] : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshWhatsappDetails = (id = whatsappDetailId) => {
    const newURL = id ? endpoints.whastappDetail.details(id) : null;
    if (!newURL) return;
    mutate(newURL);
  };

  return {
    whatsappDetail: data,
    whatsappDetailLoading: isLoading,
    whatsappDetailError: error,
    whatsappDetailValidating: isValidating,
    refreshWhatsappDetails,
  };
}

import useSWR from 'swr';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

export function useGetWhatsappDetail(whatsappDetailId) {
  const URL = whatsappDetailId ? [endpoints.whastappDetail.details(whatsappDetailId)] : null;

  const { data, isLoading, error, isValidating , mutate} = useSWR(URL, fetcher);

  const refreshWhatsappDetails = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return{
      whatsappDetail: data,
      whatsappDetailLoading: isLoading,
      whatsappDetailError: error,
      whatsappDetailValidating: isValidating,
      refreshWhatsappDetails,
    };
}
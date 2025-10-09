'use client';

import { useParams } from 'next/navigation';
import { useGetSubscriptions } from 'src/api/subscription';
import SubscriptionInvoiceDetails from 'src/sections/account/invoice-details';

export default function SubscriptionInvoiceDetailsPage() {
  const { invoiceId } = useParams();
  const { subscriptions, isLoading } = useGetSubscriptions();

  if (isLoading) return <div>Loading...</div>;

  const selectedInvoice = subscriptions?.find(
    (item) => String(item.invoiceId) === String(invoiceId)
  );

  if (!selectedInvoice) return <div>Invoice not found</div>;

  return <SubscriptionInvoiceDetails invoice={selectedInvoice} />;
}

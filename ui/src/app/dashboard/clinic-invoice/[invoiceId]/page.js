'use client';

import { useParams } from 'next/navigation';
import { useGetSubscriptions } from 'src/api/subscription';
import SubscriptionInvoiceDetails from 'src/sections/account/invoice-details';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Subscription Invoice',
};

export default function SubscriptionInvoiceDetailsPage() {
  const { invoiceId } = useParams(); // get dynamic [invoiceId] from the URL
  const { subscriptions, isLoading } = useGetSubscriptions();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // find the subscription that matches the invoiceId from the URL
  const selectedInvoice = subscriptions?.find(
    (item) => String(item.invoiceId) === String(invoiceId)
  );

  if (!selectedInvoice) {
    return <div>Invoice not found</div>;
  }

  // pass only the matching invoice data to the details component
  return <SubscriptionInvoiceDetails invoice={selectedInvoice} />;
}

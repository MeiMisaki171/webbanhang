import { AdminOrderDetailClient } from "@/components/admin-order-detail-client";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <AdminOrderDetailClient orderId={id} />;
}

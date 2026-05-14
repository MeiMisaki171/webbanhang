import { AdminProductFormClient } from "@/components/admin-product-form-client";

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { id } = await params;
  return <AdminProductFormClient productId={id} />;
}

import type {
  AdminCategoryInput,
  AdminCategoryNode,
  AdminDashboardStats,
  AdminOrderDetail,
  AdminOrderListQuery,
  AdminPaginatedOrders,
  AdminPaginatedProducts,
  AdminProductDetail,
  AdminProductInput,
  AdminUpdateOrderStatusInput,
  AdminUpdatePaymentStatusInput,
  UploadPresignInput,
  UploadPresignResponse,
} from "@repo/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

async function fetchAdminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (typeof body.message === "string") {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join(", ");
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  return fetchAdminJson<AdminDashboardStats>("/admin/dashboard/stats", { cache: "no-store" });
}

export async function fetchAdminCategories(): Promise<AdminCategoryNode[]> {
  return fetchAdminJson<AdminCategoryNode[]>("/admin/categories", { cache: "no-store" });
}

export async function createAdminCategory(input: AdminCategoryInput): Promise<AdminCategoryNode> {
  return fetchAdminJson<AdminCategoryNode>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminCategory(
  id: string,
  input: AdminCategoryInput,
): Promise<AdminCategoryNode> {
  return fetchAdminJson<AdminCategoryNode>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAdminCategory(id: string): Promise<{ id: string }> {
  return fetchAdminJson<{ id: string }>(`/admin/categories/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAdminProducts(page = 1, pageSize = 20): Promise<AdminPaginatedProducts> {
  return fetchAdminJson<AdminPaginatedProducts>(
    `/admin/products${buildQuery({ page, pageSize })}`,
    { cache: "no-store" },
  );
}

export async function fetchAdminProduct(id: string): Promise<AdminProductDetail> {
  return fetchAdminJson<AdminProductDetail>(`/admin/products/${id}`, { cache: "no-store" });
}

export async function createAdminProduct(input: AdminProductInput): Promise<AdminProductDetail> {
  return fetchAdminJson<AdminProductDetail>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductInput,
): Promise<AdminProductDetail> {
  return fetchAdminJson<AdminProductDetail>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAdminProduct(id: string): Promise<{ id: string }> {
  return fetchAdminJson<{ id: string }>(`/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAdminOrders(
  query: Partial<AdminOrderListQuery> = {},
): Promise<AdminPaginatedOrders> {
  return fetchAdminJson<AdminPaginatedOrders>(
    `/admin/orders${buildQuery(query as Record<string, string | number | undefined>)}`,
    { cache: "no-store" },
  );
}

export async function fetchAdminOrder(id: string): Promise<AdminOrderDetail> {
  return fetchAdminJson<AdminOrderDetail>(`/admin/orders/${id}`, { cache: "no-store" });
}

export async function updateAdminOrderStatus(
  id: string,
  input: AdminUpdateOrderStatusInput,
): Promise<AdminOrderDetail> {
  return fetchAdminJson<AdminOrderDetail>(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateAdminPaymentStatus(
  paymentId: string,
  input: AdminUpdatePaymentStatusInput,
): Promise<AdminOrderDetail> {
  return fetchAdminJson<AdminOrderDetail>(`/admin/payments/${paymentId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function presignAdminUpload(input: UploadPresignInput): Promise<UploadPresignResponse> {
  return fetchAdminJson<UploadPresignResponse>("/upload/presign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadPresignedFile(
  presign: UploadPresignResponse,
  file: File,
): Promise<void> {
  const response = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: presign.headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Không tải được ảnh lên kho lưu trữ.");
  }
}

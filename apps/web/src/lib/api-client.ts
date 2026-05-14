const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export type HealthResponse = {
  status: string;
  database: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error("Không thể kết nối API.");
  }

  return response.json() as Promise<HealthResponse>;
}

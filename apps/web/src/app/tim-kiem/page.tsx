import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type TimKiemRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TimKiemRedirect({ searchParams }: TimKiemRedirectProps) {
  const query = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    params.set(key, value);
  }

  const queryString = params.toString();
  redirect(queryString ? `/?${queryString}` : "/");
}

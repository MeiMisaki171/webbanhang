import { fetchCategories } from "@/lib/api-client";
import { StorefrontShellClient } from "@/components/storefront-shell-client";

type StorefrontShellProps = {
  children: React.ReactNode;
};

export async function StorefrontShell({ children }: StorefrontShellProps) {
  let categories = await fetchCategories().catch(() => []);

  return <StorefrontShellClient categories={categories}>{children}</StorefrontShellClient>;
}

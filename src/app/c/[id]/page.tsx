import { redirect } from "next/navigation";

/**
 * /c/[id] - Short URL redirect
 * 
 * Redirects to the compose API endpoint.
 * When accessed from a browser, could show a preview page.
 * When accessed from CLI, the compose API is called directly.
 */
export default async function ShareRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // For browser access, redirect to a compose preview
  // For now, redirect to the composer page with the share ID
  redirect(`/fusion?load=${id}`);
}

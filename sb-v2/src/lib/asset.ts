/**
 * Prefix a public path with the deploy base path (e.g. "/aibardefi" on GitHub
 * Pages). next/image applies basePath automatically, but plain <img> tags do
 * not — wrap their src in this so assets resolve under a subpath.
 */
export const asset = (path: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

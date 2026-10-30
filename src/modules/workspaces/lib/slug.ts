const MAX_SLUG_LENGTH = 120;

export function slugifyWorkspaceName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");

  return slug || "workspace";
}

export async function createUniqueWorkspaceSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = slugifyWorkspaceName(name);
  let slug = baseSlug;
  let suffix = 2;

  while (await exists(slug)) {
    const suffixText = `-${suffix}`;
    slug = `${baseSlug.slice(0, MAX_SLUG_LENGTH - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  return slug;
}
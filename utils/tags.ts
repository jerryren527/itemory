export function parseTags(value: string): string[] | null {
  const tags = value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : null;
}

export function joinTags(tags: string[]): string {
  return tags.join(", ");
}

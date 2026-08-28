/**
 * DRF returns either {message: "..."} or, for serializer validation failures,
 * a field-keyed dict like {username: ["This username is already taken."]}.
 * Falls back to the first string found in that dict, then to `fallback`.
 */
export function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (typeof obj.message === "string") return obj.message;

    for (const value of Object.values(obj)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
      if (typeof value === "string") return value;
    }
  }

  return fallback;
}

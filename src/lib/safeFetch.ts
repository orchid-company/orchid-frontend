export type SafeJsonResult<T> = {
  data: T | null;
  response: Response;
};

export async function safeFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeJsonResult<T>> {
  const response = await fetch(input, init);
  let data: T | null = null;

  const contentType = response.headers.get("content-type") ?? "";
  if (response.ok && contentType.includes("application/json")) {
    try {
      data = (await response.json()) as T;
    } catch (error) {
      console.error(
        `[safeFetchJson] Failed to parse JSON for ${input.toString?.() ?? String(
          input
        )}`,
        error
      );
    }
  }

  return { data, response };
}


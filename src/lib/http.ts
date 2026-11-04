/**
 * Shared request/response contract for the `/api/*` route handlers and a
 * small `postJson` client helper so every form (giving, book checkout,
 * RSVP, contact, newsletter) talks to its endpoint the same way.
 */

export interface ApiIssue {
  path: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  referenceId?: string;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: string;
  issues?: ApiIssue[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PostJsonResult<T> {
  ok: boolean;
  status: number;
  result: ApiResponse<T> | null;
}

/** POSTs JSON to a same-origin API route and normalizes the outcome —
 *  network failures and non-JSON responses never throw, they just come
 *  back as `{ ok: false, result: null }` for the caller to show a
 *  generic error for. */
export async function postJson<T>(url: string, body: unknown): Promise<PostJsonResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    return { ok: response.ok, status: response.status, result };
  } catch {
    return { ok: false, status: 0, result: null };
  }
}

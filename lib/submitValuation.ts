import type { ValuationData } from './valuation';

export type SubmitErrorCode = 'notConfigured' | 'failed' | 'network';
export type SubmitResult = { ok: true } | { ok: false; code: SubmitErrorCode };

/**
 * Single integration point for the valuation request.
 *
 * TODO: connect final form endpoint.
 * No backend, CRM, or email service exists in this project yet, so this
 * deliberately does NOT report success — reporting a delivery that never
 * happened would lose real leads. Replace the body below with the real call
 * (API route, Formspree, Supabase, CRM webhook…) and return `{ ok: true }`
 * only once the request has actually been accepted.
 *
 * `data.photos` holds real File objects and needs multipart/form-data or a
 * signed upload; it is intentionally left out of any JSON payload.
 */
export async function submitValuation(data: ValuationData): Promise<SubmitResult> {
  const endpoint = process.env.NEXT_PUBLIC_VALUATION_ENDPOINT;

  if (!endpoint) {
    return { ok: false, code: 'notConfigured' };
  }

  const body = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (key === 'photos') continue;
    body.append(key, Array.isArray(value) ? value.join(', ') : String(value));
  }
  data.photos.forEach((file, i) => body.append(`photo_${i}`, file));

  try {
    const response = await fetch(endpoint, { method: 'POST', body });
    if (!response.ok) {
      return { ok: false, code: 'failed' };
    }
    return { ok: true };
  } catch {
    return { ok: false, code: 'network' };
  }
}

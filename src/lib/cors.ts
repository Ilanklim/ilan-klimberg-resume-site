import { corsOrigins } from './env.js';

export interface CorsOptions {
  origin?: string;
  method?: string;
}

export function validateOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return corsOrigins.includes(origin);
}

export function getCorsHeaders(origin: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    'Vary': 'Origin',
  };

  if (validateOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    headers['Access-Control-Max-Age'] = '86400';
  }

  return headers;
}

export function handlePreflight(origin: string | undefined): Response | null {
  if (!validateOrigin(origin)) {
    return new Response(
      JSON.stringify({
        code: 'FORBIDDEN',
        message: 'Origin not allowed',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
        },
      }
    );
  }

  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

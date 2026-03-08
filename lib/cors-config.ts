/**
 * CORS Configuration
 * Story 7-B-1: CORS Configuration & Security Headers
 *
 * This file defines the CORS policy for the application.
 * Origin validation is done in middleware.ts
 */

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  allowCredentials: boolean;
}

/**
 * Environment-based allowed origins
 * These origins are safe for cross-origin requests
 */
export const getAllowedOrigins = (): string[] => {
  const env = process.env.NODE_ENV;
  const customOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];

  const baseOrigins: Record<string, string[]> = {
    development: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    production: [
      'https://tech-arauz.vercel.app',
      'https://www.tech-arauz.vercel.app',
    ],
    staging: [
      'https://staging-arauz.vercel.app',
    ],
  };

  // Return environment-specific origins, or custom from env var
  const origins = baseOrigins[env] || baseOrigins.production;

  // Merge with custom origins from environment variable
  return Array.from(new Set([...origins, ...customOrigins]));
};

/**
 * CORS Configuration
 * Used in middleware.ts for request validation
 */
export const corsConfig: CORSConfig = {
  allowedOrigins: getAllowedOrigins(),

  // HTTP methods allowed for cross-origin requests
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Request headers allowed for cross-origin requests
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'Accept',
    'Accept-Language',
  ],

  // Response headers exposed to the browser
  exposedHeaders: [
    'Content-Type',
    'X-Total-Count',  // For pagination
    'X-Page-Number',
    'X-Request-ID',
  ],

  // How long (in seconds) the browser can cache preflight response
  // 24 hours = 86400 seconds
  maxAge: 86400,

  // Allow credentials (cookies, auth headers) in cross-origin requests
  // Important: when true, allowedOrigins cannot be '*'
  allowCredentials: true,
};

/**
 * Security Headers Configuration
 * Used in next.config.mjs for static headers
 */
export const securityHeaders = {
  // Prevent browsers from MIME-sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Force HTTPS in production (enable via env var)
  ...(process.env.HSTS_ENABLED === 'true' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),

  // Content Security Policy (baseline)
  ...(process.env.CSP_ENABLED !== 'false' && {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Relaxed for Vercel/Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  }),

  // Control browser features
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=()',

  // Additional security header
  'X-Permitted-Cross-Domain-Policies': 'none',
};

/**
 * Validate if an origin is allowed
 * @param origin - The origin header from request
 * @returns true if origin is in allowedOrigins list
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;

  const allowedOrigins = corsConfig.allowedOrigins;

  // Exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Pattern matching (e.g., *.vercel.app)
  // Currently not used, but can be extended
  return false;
}

/**
 * Get CORS headers for a given origin
 * @param origin - The origin header from request
 * @returns CORS response headers object
 */
export function getCORSHeaders(origin: string | undefined) {
  const headers: Record<string, string> = {};

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = corsConfig.allowedMethods.join(', ');
    headers['Access-Control-Allow-Headers'] = corsConfig.allowedHeaders.join(', ');
    headers['Access-Control-Expose-Headers'] = corsConfig.exposedHeaders.join(', ');
    headers['Access-Control-Max-Age'] = corsConfig.maxAge.toString();

    if (corsConfig.allowCredentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  }

  return headers;
}

/**
 * Handle preflight OPTIONS request
 * @param origin - The origin header from request
 * @returns Response with appropriate CORS headers
 */
export function handleCORSPreflight(origin: string | undefined) {
  const headers = getCORSHeaders(origin);

  // Return 204 No Content for preflight
  return new Response(null, {
    status: 204,
    headers,
  });
}

import type { Request, Response } from 'express';

// Universal Serverless Handler (compatible with Vercel, Netlify, and Express)
export default async function handler(req: any, res?: any) {
  // If invoked as standard Web Fetch Request (Edge/Next.js/Cloudflare)
  if (req instanceof Request || (req && !res && typeof req.json === 'function')) {
    const data = {
      status: 'ok',
      service: 'SG Bus Arrival LTA Proxy',
      timestamp: new Date().toISOString(),
      ltaConfigured: Boolean(process.env.LTA_ACCOUNT_KEY),
    };
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Node.js / Express style handler
  const expressReq = req as Request;
  const expressRes = res as Response;

  expressRes.setHeader('Content-Type', 'application/json');
  expressRes.setHeader('Cache-Control', 'no-store');

  return expressRes.status(200).json({
    status: 'ok',
    service: 'SG Bus Arrival LTA Proxy',
    timestamp: new Date().toISOString(),
    ltaConfigured: Boolean(process.env.LTA_ACCOUNT_KEY),
  });
}

// Named export for Web Fetch / Next.js Route Handlers
export async function GET(request: Request) {
  return handler(request);
}

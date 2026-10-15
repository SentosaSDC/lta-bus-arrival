import type { Request, Response } from 'express';

const LTA_DATAMALL_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

// Universal Serverless Handler (compatible with Vercel, Netlify, AWS Lambda, and Express)
export default async function handler(req: any, res?: any) {
  // Handle Web API Request / Response (Edge / Fetch standard)
  if (req instanceof Request || (req && !res && typeof req.json === 'function')) {
    const url = new URL(req.url);
    const busStopCode = url.searchParams.get('BusStopCode') || '83139';
    const serviceNo = url.searchParams.get('ServiceNo');

    // Retrieve LTA DataMall AccountKey from environment variable (or optional header override)
    const accountKey =
      process.env.LTA_ACCOUNT_KEY ||
      req.headers.get?.('accountkey') ||
      req.headers.get?.('AccountKey') ||
      '';

    if (!accountKey) {
      return new Response(
        JSON.stringify({
          error: 'LTA_ACCOUNT_KEY is not configured',
          message:
            'Please configure the LTA_ACCOUNT_KEY environment variable. No hardcoded API key was used.',
          endpoint: `${LTA_DATAMALL_ENDPOINT}?BusStopCode=${busStopCode}`,
          BusStopCode: busStopCode,
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    try {
      let ltaUrl = `${LTA_DATAMALL_ENDPOINT}?BusStopCode=${encodeURIComponent(busStopCode)}`;
      if (serviceNo) {
        ltaUrl += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
      }

      const ltaRes = await fetch(ltaUrl, {
        method: 'GET',
        headers: {
          AccountKey: accountKey,
          accept: 'application/json',
        },
      });

      const rawText = await ltaRes.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          status: ltaRes.status,
          statusText: ltaRes.statusText,
          response: rawText,
        };
      }

      return new Response(JSON.stringify(data), {
        status: ltaRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch from LTA DataMall',
          message: err.message || 'Unknown network error',
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }

  // Node.js / Express style handler
  const expressReq = req as Request;
  const expressRes = res as Response;

  // Set CORS headers
  expressRes.setHeader('Access-Control-Allow-Origin', '*');
  expressRes.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  expressRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey');

  if (expressReq.method === 'OPTIONS') {
    return expressRes.status(204).end();
  }

  const busStopCode = (expressReq.query.BusStopCode as string) || '83139';
  const serviceNo = expressReq.query.ServiceNo as string | undefined;

  // Retrieve LTA DataMall AccountKey from environment variable (or optional header override)
  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    (expressReq.headers['accountkey'] as string) ||
    (expressReq.headers['AccountKey'] as string) ||
    '';

  if (!accountKey) {
    return expressRes.status(401).json({
      error: 'LTA_ACCOUNT_KEY is not configured',
      message:
        'Please configure the LTA_ACCOUNT_KEY environment variable. No hardcoded API key was used.',
      endpoint: `${LTA_DATAMALL_ENDPOINT}?BusStopCode=${busStopCode}`,
      BusStopCode: busStopCode,
    });
  }

  try {
    let ltaUrl = `${LTA_DATAMALL_ENDPOINT}?BusStopCode=${encodeURIComponent(busStopCode)}`;
    if (serviceNo) {
      ltaUrl += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
    }

    const ltaRes = await fetch(ltaUrl, {
      method: 'GET',
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
    });

    const rawText = await ltaRes.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        status: ltaRes.status,
        statusText: ltaRes.statusText,
        response: rawText,
      };
    }

    expressRes.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=20');
    return expressRes.status(ltaRes.status).json(data);
  } catch (err: any) {
    return expressRes.status(502).json({
      error: 'Failed to fetch from LTA DataMall',
      message: err.message || 'Unknown network error',
    });
  }
}

// Named export for Web Fetch / Next.js Route Handlers
export async function GET(request: Request) {
  return handler(request);
}

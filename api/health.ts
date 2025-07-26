import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).setHeaders(corsHeaders);
  }

  if (req.method !== 'GET') {
    return res.status(405).setHeaders(corsHeaders).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET'] 
    });
  }

  try {
    res.status(200).setHeaders(corsHeaders).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).setHeaders(corsHeaders).json({
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
}
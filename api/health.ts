import type { NextApiRequest, NextApiResponse } from "next";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
} as const;

function setCors(res: NextApiResponse) {
  for (const [k, v] of Object.entries(corsHeaders)) res.setHeader(k, v);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    setCors(res);
    res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["GET", "OPTIONS"],
    });
    return;
  }

  try {
    setCors(res);
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    });
  } catch (error) {
    console.error("Health check error:", error);
    setCors(res);
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
}

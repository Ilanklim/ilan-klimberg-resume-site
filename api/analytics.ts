import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
} as const;

function setCors(res: NextApiResponse) {
  for (const [k, v] of Object.entries(corsHeaders)) res.setHeader(k, v);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    setCors(res);
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
    return;
  }

  try {
    setCors(res);

    // Recent chats
    const { data: recentChats, error: chatsError } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (chatsError) throw chatsError;

    // Total counts (HEAD + count)
    const { count: totalChats, error: countError } = await supabase
      .from("chats")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const { count: totalDocs, error: docsError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    if (docsError) throw docsError;

    res.status(200).json({
      success: true,
      analytics: {
        totalChats: totalChats ?? 0,
        totalDocuments: totalDocs ?? 0,
        recentChats: recentChats ?? [],
      },
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    setCors(res);
    res.status(500).json({
      success: false,
      error: error?.message ?? "Unknown error",
    });
  }
}

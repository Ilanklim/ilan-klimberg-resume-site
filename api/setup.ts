import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setupDatabase, supabase } from "../lib/supabase";
import { GeminiEmbeddings } from "../lib/gemini-embeddings";
import { chunkResume, getResumeStats } from "../lib/resume-chunker";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

function setCors(res: VercelResponse) {
  for (const [k, v] of Object.entries(corsHeaders)) {
    res.setHeader(k, v);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    await handleInit(req, res);
    return;
  }

  if (req.method === "GET") {
    await handleStatus(req, res);
    return;
  }

  setCors(res);
  res.status(405).json({ success: false, error: "Method not allowed" });
}

type DocRow = {
  content: string;
  metadata: unknown;
  embedding: number[];
};

async function handleInit(_req: VercelRequest, res: VercelResponse) {
  try {
    setCors(res);
    console.log("🚀 Starting RAG system initialization...");

    await setupDatabase();

    const embeddings = new GeminiEmbeddings(process.env.GOOGLE_AI_API_KEY!);

    const chunks = await chunkResume();
    console.log(`📄 Created ${chunks.length} resume chunks`);

    // Clear existing documents (keep a null UUID if that's intentional)
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.warn("Error clearing documents:", deleteError.message);
    }

    const documentsToInsert: DocRow[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `🔍 Embedding chunk ${i + 1}/${chunks.length}: ${chunk.content.substring(0, 50)}...`
      );

      try {
        const embedding = await embeddings.embedQuery(chunk.content);
        console.log(
          `✅ Chunk ${i + 1} embedded successfully (${embedding.length} dimensions)`
        );

        documentsToInsert.push({
          content: chunk.content,
          metadata: chunk.metadata,
          embedding,
        });

        // Gentle throttle
        await new Promise((r) => setTimeout(r, 100));
      } catch (err: any) {
        console.error(`❌ Error embedding chunk ${i + 1}:`, err?.message ?? err);
      }
    }

    // Batch insert
    const batchSize = 10;
    for (let i = 0; i < documentsToInsert.length; i += batchSize) {
      const batch = documentsToInsert.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from("documents")
        .insert(batch);

      if (insertError) {
        console.error("Error inserting batch:", insertError);
      } else {
        console.log(
          `✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            documentsToInsert.length / batchSize
          )}`
        );
      }
    }

    const stats = await getResumeStats();

    res.status(200).json({
      success: true,
      message: "RAG system initialized successfully",
      stats: {
        documentsInserted: documentsToInsert.length,
        totalChunks: chunks.length,
        resumeStats: stats,
      },
    });
  } catch (err: any) {
    console.error("Setup error:", err);
    setCors(res);
    res.status(500).json({
      success: false,
      error: err?.message ?? "Unknown error",
    });
  }
}

async function handleStatus(_req: VercelRequest, res: VercelResponse) {
  try {
    setCors(res);

    const { count, error } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const { count: chatCount, error: chatError } = await supabase
      .from("chats")
      .select("*", { count: "exact", head: true });

    if (chatError) throw chatError;

    const stats = await getResumeStats();

    res.status(200).json({
      success: true,
      status: {
        documentsCount: count ?? 0,
        chatsCount: chatCount ?? 0,
        resumeStats: stats,
        expectedChunks: stats.totalChunks,
      },
    });
  } catch (err: any) {
    console.error("Status check error:", err);
    setCors(res);
    res.status(500).json({
      success: false,
      error: err?.message ?? "Unknown error",
    });
  }
}

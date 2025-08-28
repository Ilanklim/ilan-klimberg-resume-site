// pages/api/query.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiEmbeddings } from "../lib/gemini-embeddings";
import { supabase } from "../lib/supabase";
import { querySchema } from "../lib/validation";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

function setCors(res: NextApiResponse) {
  for (const [k, v] of Object.entries(corsHeaders)) res.setHeader(k, v);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
    return;
  }

  try {
    const validation = querySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error:
          "Invalid input: " +
          validation.error.errors.map((e) => e.message).join(", "),
      });
      return;
    }

    const sanitizeInput = (input: string) =>
      input
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "")
        .trim();

    const { question } = validation.data;
    const sanitizedQuestion = sanitizeInput(question);
    if (!sanitizedQuestion) {
      res.status(400).json({
        success: false,
        error: "Question cannot be empty after sanitization",
      });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ success: false, error: "Authorization required" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({ success: false, error: "Invalid or expired session" });
      return;
    }

    const { data: canQuery, error: limitError } = await supabase.rpc(
      "can_make_query",
      { target_user_id: user.id }
    );
    if (limitError) {
      res.status(500).json({ success: false, error: "Unable to verify query limit" });
      return;
    }
    if (!canQuery) {
      const { data: dailyCount } = await supabase.rpc("get_daily_query_count", {
        target_user_id: user.id,
      });
      res.status(429).json({
        success: false,
        error: `Daily query limit reached (${dailyCount}/10). Try again tomorrow!`,
        dailyCount,
        maxQueries: 10,
      });
      return;
    }

    const googleAIKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleAIKey) {
      res.status(500).json({ success: false, error: "AI service configuration error" });
      return;
    }

    const embeddings = new GeminiEmbeddings(googleAIKey);
    const questionEmbedding = await embeddings.embedQuery(sanitizedQuestion);

    const { data: similarDocs, error: searchError } = await supabase.rpc(
      "match_documents_secure",
      { query_embedding: questionEmbedding, match_threshold: 0.3, match_count: 5 }
    );

    let context: string;
    if (searchError || !similarDocs?.length) {
      context =
        "This is Ilan Klimberg's resume information. He is a data scientist and software engineer with experience in machine learning, web development, and blockchain technology.";
    } else {
      context = similarDocs.map((d: { content: string }) => d.content).join("\n\n");
    }

    const genAI = new GoogleGenerativeAI(googleAIKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an AI assistant helping to answer questions about Ilan Klimberg's resume and experience. 

Context from Ilan's resume:
${context}

Question: ${sanitizedQuestion}

Please provide a helpful, accurate answer based on the context above. Be conversational and professional. If the context doesn't contain enough information to fully answer the question, acknowledge what you can answer and suggest reaching out to Ilan directly.

Answer:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    await supabase.from("chats").insert({
      user_id: user.id,
      message: sanitizedQuestion,
      response: answer,
    });

    const { data: updatedCount } = await supabase.rpc("get_daily_query_count", {
      target_user_id: user.id,
    });

    res.status(200).json({
      success: true,
      answer,
      question: sanitizedQuestion,
      dailyCount: updatedCount || 0,
      maxQueries: 10,
      remainingQueries: Math.max(0, 10 - (updatedCount || 0)),
    });
  } catch (err: any) {
    const isProduction = process.env.NODE_ENV === "production";
    res.status(500).json({
      success: false,
      error: isProduction
        ? "An error occurred while processing your request. Please try again later."
        : `Error: ${err?.message ?? String(err)}`,
    });
  }
}

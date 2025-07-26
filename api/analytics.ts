import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

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
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get recent chats
    const { data: recentChats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (chatsError) {
      throw chatsError;
    }
    
    // Get total counts
    const { count: totalChats, error: countError } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw countError;
    }
    
    const { count: totalDocs, error: docsError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (docsError) {
      throw docsError;
    }
    
    res.status(200).setHeaders(corsHeaders).json({
      success: true,
      analytics: {
        totalChats,
        totalDocuments: totalDocs,
        recentChats: recentChats || []
      }
    });
    
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).setHeaders(corsHeaders).json({
      success: false,
      error: error.message
    });
  }
}
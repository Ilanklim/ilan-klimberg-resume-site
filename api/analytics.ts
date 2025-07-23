import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
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
    
    res.json({
      success: true,
      analytics: {
        totalChats,
        totalDocuments: totalDocs,
        recentChats: recentChats || []
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
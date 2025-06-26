import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface DatabaseAsset {
  id: string;
  title: string;
  description: string | null;
  file_type: string;
  file_size: number;
  content_hash: string;
  status: string;
  protection_score: number | null;
  blockchain_hash: string | null;
  blockchain_network: string | null;
  blockchain_timestamp: string | null;
  ipfs_hash: string | null;
  ipfs_url: string | null;
  download_url: string | null;
  is_watermarked: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface AssetResponse {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  fileSize: number;
  contentHash: string;
  status: 'processing' | 'protected' | 'failed' | 'pending';
  protectionScore: number | null;
  blockchain: {
    hash: string | null;
    network: string | null;
    timestamp: string | null;
  };
  ipfs: {
    hash: string | null;
    url: string | null;
  };
  downloadUrl: string | null;
  isWatermarked: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: {
    sizeFormatted: string;
    protectionLevel: 'low' | 'medium' | 'high';
    isBlockchainVerified: boolean;
    isIpfsStored: boolean;
  };
}

interface AssetListResponse {
  assets: AssetResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalAssets: number;
    protectedAssets: number;
    blockchainVerified: number;
    averageProtectionScore: number;
  };
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getProtectionLevel = (score: number | null): 'low' | 'medium' | 'high' => {
  if (!score) return 'low';
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};

const transformAsset = (dbAsset: DatabaseAsset): AssetResponse => {
  return {
    id: dbAsset.id,
    title: dbAsset.title,
    description: dbAsset.description,
    fileType: dbAsset.file_type,
    fileSize: dbAsset.file_size,
    contentHash: dbAsset.content_hash,
    status: dbAsset.status as 'processing' | 'protected' | 'failed' | 'pending',
    protectionScore: dbAsset.protection_score,
    blockchain: {
      hash: dbAsset.blockchain_hash,
      network: dbAsset.blockchain_network,
      timestamp: dbAsset.blockchain_timestamp,
    },
    ipfs: {
      hash: dbAsset.ipfs_hash,
      url: dbAsset.ipfs_url,
    },
    downloadUrl: dbAsset.download_url,
    isWatermarked: dbAsset.is_watermarked,
    createdAt: dbAsset.created_at,
    updatedAt: dbAsset.updated_at,
    metadata: {
      sizeFormatted: formatFileSize(dbAsset.file_size),
      protectionLevel: getProtectionLevel(dbAsset.protection_score),
      isBlockchainVerified: !!dbAsset.blockchain_hash,
      isIpfsStored: !!dbAsset.ipfs_hash,
    },
  };
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseClient
      .from('content')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: assets, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch assets' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get summary statistics
    const { data: summaryData } = await supabaseClient
      .from('content')
      .select('status, protection_score, blockchain_hash')
      .eq('user_id', user.id);

    const totalAssets = count || 0;
    const protectedAssets = summaryData?.filter(asset => asset.status === 'protected').length || 0;
    const blockchainVerified = summaryData?.filter(asset => asset.blockchain_hash).length || 0;
    const protectionScores = summaryData?.map(asset => asset.protection_score).filter(score => score !== null) || [];
    const averageProtectionScore = protectionScores.length > 0 
      ? protectionScores.reduce((sum, score) => sum + score, 0) / protectionScores.length 
      : 0;

    // Transform and prepare response
    const transformedAssets: AssetResponse[] = (assets || []).map(transformAsset);

    const response: AssetListResponse = {
      assets: transformedAssets,
      pagination: {
        total: totalAssets,
        page,
        limit,
        hasNext: offset + limit < totalAssets,
        hasPrev: page > 1,
      },
      summary: {
        totalAssets,
        protectedAssets,
        blockchainVerified,
        averageProtectionScore: Math.round(averageProtectionScore),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 
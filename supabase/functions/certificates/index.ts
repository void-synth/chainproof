import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface CertificateResponse {
  id: string;
  certificateId: string;
  ownerName: string;
  assetTitle: string;
  contentHash: string;
  protectionDate: string;
  assetType: string | null;
  fileSize: number | null;
  protectionScore: number | null;
  blockchain: {
    hash: string | null;
    network: string | null;
    timestamp: string | null;
  };
  ipfs: {
    hash: string | null;
    url: string | null;
    uri: string | null;
  };
  downloadUrl: string;
  verificationUrl: string;
  status: 'active' | 'revoked' | 'expired';
  verificationCount: number;
  lastVerifiedAt: string | null;
  emailSent: boolean;
  emailSentAt: string | null;
  recipientEmail: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: {
    sizeFormatted: string | null;
    isBlockchainVerified: boolean;
    isIpfsStored: boolean;
    daysSinceIssued: number;
  };
}

interface CertificatesResponse {
  certificates: CertificateResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalCertificates: number;
    activeCertificates: number;
    revokedCertificates: number;
    totalVerifications: number;
    averageProtectionScore: number;
    blockchainVerifiedCount: number;
  };
}

const formatFileSize = (bytes: number | null): string | null => {
  if (!bytes) return null;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getDaysSinceIssued = (createdAt: string): number => {
  const issued = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - issued.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const transformCertificate = (dbCert: any): CertificateResponse => {
  const verificationUrl = `https://chainproof.io/verify/${dbCert.certificate_id}`;
  
  return {
    id: dbCert.id,
    certificateId: dbCert.certificate_id,
    ownerName: dbCert.owner_name,
    assetTitle: dbCert.asset_title,
    contentHash: dbCert.content_hash,
    protectionDate: dbCert.protection_date,
    assetType: dbCert.asset_type,
    fileSize: dbCert.file_size,
    protectionScore: dbCert.protection_score,
    blockchain: {
      hash: dbCert.blockchain_hash,
      network: dbCert.blockchain_network,
      timestamp: dbCert.blockchain_timestamp,
    },
    ipfs: {
      hash: dbCert.ipfs_hash,
      url: dbCert.ipfs_url,
      uri: dbCert.ipfs_uri,
    },
    downloadUrl: dbCert.download_url,
    verificationUrl,
    status: dbCert.status || 'active',
    verificationCount: dbCert.verification_count || 0,
    lastVerifiedAt: dbCert.last_verified_at,
    emailSent: dbCert.email_sent || false,
    emailSentAt: dbCert.email_sent_at,
    recipientEmail: dbCert.recipient_email,
    createdAt: dbCert.created_at,
    updatedAt: dbCert.updated_at,
    metadata: {
      sizeFormatted: formatFileSize(dbCert.file_size),
      isBlockchainVerified: !!dbCert.blockchain_hash,
      isIpfsStored: !!dbCert.ipfs_hash,
      daysSinceIssued: getDaysSinceIssued(dbCert.created_at),
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
      .from('certificates')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`asset_title.ilike.%${search}%,owner_name.ilike.%${search}%,certificate_id.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: certificates, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch certificates' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get summary statistics
    const { data: summaryData } = await supabaseClient
      .from('certificates')
      .select('status, protection_score, blockchain_hash, verification_count')
      .eq('user_id', user.id);

    const totalCertificates = count || 0;
    const activeCertificates = summaryData?.filter(cert => cert.status === 'active' || !cert.status).length || 0;
    const revokedCertificates = summaryData?.filter(cert => cert.status === 'revoked').length || 0;
    const totalVerifications = summaryData?.reduce((sum, cert) => sum + (cert.verification_count || 0), 0) || 0;
    const blockchainVerifiedCount = summaryData?.filter(cert => cert.blockchain_hash).length || 0;
    
    const protectionScores = summaryData?.map(cert => cert.protection_score).filter(score => score !== null) || [];
    const averageProtectionScore = protectionScores.length > 0 
      ? Math.round(protectionScores.reduce((sum, score) => sum + score, 0) / protectionScores.length)
      : 0;

    // Transform and prepare response
    const transformedCertificates: CertificateResponse[] = (certificates || []).map(transformCertificate);

    const response: CertificatesResponse = {
      certificates: transformedCertificates,
      pagination: {
        total: totalCertificates,
        page,
        limit,
        hasNext: offset + limit < totalCertificates,
        hasPrev: page > 1,
      },
      summary: {
        totalCertificates,
        activeCertificates,
        revokedCertificates,
        totalVerifications,
        averageProtectionScore,
        blockchainVerifiedCount,
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
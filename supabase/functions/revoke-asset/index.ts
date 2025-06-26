import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RevokeRequest {
  reason?: string;
  notifyOwner?: boolean;
}

interface RevokeResponse {
  success: boolean;
  message: string;
  assetId: string;
  revokedAt: string;
  data?: {
    previousStatus: string;
    certificatesRevoked: number;
    blockchainUpdateRequired?: boolean;
    ipfsRemovalRequired?: boolean;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept DELETE method
    if (req.method !== 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Extract asset ID from URL path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const assetId = pathSegments[pathSegments.length - 1];

    if (!assetId || assetId === 'revoke-asset') {
      return new Response(
        JSON.stringify({ error: 'Asset ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body (optional)
    let requestData: RevokeRequest = {};
    try {
      const body = await req.text();
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (error) {
      // Ignore JSON parsing errors, use empty object
    }

    // Verify asset exists and belongs to user
    const { data: asset, error: assetError } = await supabaseClient
      .from('content')
      .select('id, title, status, user_id, blockchain_hash, ipfs_hash')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single();

    if (assetError || !asset) {
      return new Response(
        JSON.stringify({ 
          error: assetError?.code === 'PGRST116' ? 'Asset not found' : 'Failed to fetch asset' 
        }),
        {
          status: assetError?.code === 'PGRST116' ? 404 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if asset is already revoked
    if (asset.status === 'revoked') {
      return new Response(
        JSON.stringify({ 
          error: 'Asset is already revoked',
          assetId,
          revokedAt: asset.updated_at || asset.created_at
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const revokedAt = new Date().toISOString();
    const previousStatus = asset.status;

    // Start transaction: Update asset status to revoked
    const { error: updateError } = await supabaseClient
      .from('content')
      .update({ 
        status: 'revoked',
        updated_at: revokedAt,
        revocation_reason: requestData.reason || 'User requested revocation',
        revoked_at: revokedAt
      })
      .eq('id', assetId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update asset status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to revoke asset' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Revoke any associated certificates
    const { data: certificates, error: certError } = await supabaseClient
      .from('certificates')
      .select('id')
      .eq('content_hash', asset.content_hash || '')
      .eq('user_id', user.id)
      .neq('status', 'revoked');

    let certificatesRevoked = 0;
    
    if (!certError && certificates && certificates.length > 0) {
      const certificateIds = certificates.map(cert => cert.id);
      
      const { error: revokeCertError } = await supabaseClient
        .from('certificates')
        .update({ 
          status: 'revoked',
          updated_at: revokedAt,
          revocation_reason: requestData.reason || 'Asset protection revoked'
        })
        .in('id', certificateIds)
        .eq('user_id', user.id);

      if (!revokeCertError) {
        certificatesRevoked = certificates.length;
      }
    }

    // Log the revocation activity
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'asset_revoked',
        resource_type: 'content',
        resource_id: assetId,
        details: {
          assetTitle: asset.title,
          previousStatus,
          reason: requestData.reason,
          certificatesRevoked,
          timestamp: revokedAt
        }
      });

    // TODO: In production, trigger blockchain update and IPFS removal
    // These would be background jobs or webhook triggers
    const blockchainUpdateRequired = !!asset.blockchain_hash;
    const ipfsRemovalRequired = !!asset.ipfs_hash;

    // TODO: Send notification email if requested
    if (requestData.notifyOwner) {
      // This would trigger an email notification in production
      console.log(`Email notification queued for asset revocation: ${assetId}`);
    }

    const response: RevokeResponse = {
      success: true,
      message: `Asset "${asset.title}" has been successfully revoked`,
      assetId,
      revokedAt,
      data: {
        previousStatus,
        certificatesRevoked,
        blockchainUpdateRequired,
        ipfsRemovalRequired,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 
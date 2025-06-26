import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface PiracyAlert {
  id: string;
  contentId: string;
  contentTitle: string;
  alertType: 'high_risk' | 'medium_risk' | 'low_risk' | 'suspicious';
  severity: 'critical' | 'high' | 'medium' | 'low';
  matchScore: number;
  suspiciousUrl: string;
  sourceType: 'torrent' | 'file_sharing' | 'social_media' | 'website' | 'marketplace';
  detectionMethod: 'ai_scan' | 'hash_match' | 'user_report' | 'automated_scan';
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  metadata: {
    similarityDetails?: any;
    aiAnalysis?: any;
    screenshotUrl?: string;
    reportedBy?: string;
  };
}

interface AlertsResponse {
  alerts: PiracyAlert[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalAlerts: number;
    newAlerts: number;
    highRiskAlerts: number;
    resolvedAlerts: number;
    averageMatchScore: number;
  };
}

const generateMockAlerts = (userId: string, contentIds: string[]): PiracyAlert[] => {
  const alertTypes: PiracyAlert['alertType'][] = ['high_risk', 'medium_risk', 'low_risk', 'suspicious'];
  const severities: PiracyAlert['severity'][] = ['critical', 'high', 'medium', 'low'];
  const sourceTypes: PiracyAlert['sourceType'][] = ['torrent', 'file_sharing', 'social_media', 'website', 'marketplace'];
  const detectionMethods: PiracyAlert['detectionMethod'][] = ['ai_scan', 'hash_match', 'user_report', 'automated_scan'];
  const statuses: PiracyAlert['status'][] = ['new', 'investigating', 'resolved', 'false_positive'];

  const mockUrls = [
    'https://suspicious-torrent-site.com/download/12345',
    'https://file-sharing-platform.net/file/abc123',
    'https://social-media.com/post/stolen-content',
    'https://marketplace.example/listing/unauthorized-copy',
    'https://piracy-site.org/content/duplicate-file',
    'https://illegal-download.com/get/protected-content'
  ];

  const descriptions = [
    'Unauthorized distribution of protected content detected',
    'High similarity match found on file-sharing platform', 
    'Potential copyright infringement identified',
    'Duplicate content discovered on suspicious website',
    'AI analysis detected likely pirated material',
    'User-reported copyright violation'
  ];

  const alerts: PiracyAlert[] = [];
  
  // Generate 10-15 mock alerts
  const alertCount = Math.floor(Math.random() * 6) + 10;
  
  for (let i = 0; i < alertCount; i++) {
    const contentId = contentIds[Math.floor(Math.random() * contentIds.length)] || 'demo-content-id';
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100%
    
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    
    alerts.push({
      id: `alert-${i + 1}-${Date.now()}`,
      contentId,
      contentTitle: `Protected Asset ${i + 1}`,
      alertType,
      severity,
      matchScore,
      suspiciousUrl: mockUrls[Math.floor(Math.random() * mockUrls.length)],
      sourceType: sourceTypes[Math.floor(Math.random() * sourceTypes.length)],
      detectionMethod: detectionMethods[Math.floor(Math.random() * detectionMethods.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status,
      resolvedAt: status === 'resolved' ? new Date(createdAt).toISOString() : null,
      resolvedBy: status === 'resolved' ? userId : null,
      createdAt,
      metadata: {
        similarityDetails: {
          visualSimilarity: Math.floor(Math.random() * 30) + 70,
          textSimilarity: Math.floor(Math.random() * 25) + 75,
          structuralSimilarity: Math.floor(Math.random() * 20) + 80
        },
        aiAnalysis: {
          confidence: matchScore,
          method: 'deep_learning_comparison',
          processingTime: Math.floor(Math.random() * 5000) + 1000
        },
        screenshotUrl: `https://chainproof-screenshots.s3.amazonaws.com/alert-${i + 1}.png`
      }
    });
  }
  
  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    const severity = url.searchParams.get('severity');
    const status = url.searchParams.get('status');
    const contentId = url.searchParams.get('contentId');
    const offset = (page - 1) * limit;

    // Get user's content IDs for generating realistic alerts
    const { data: userContent } = await supabaseClient
      .from('content')
      .select('id, title')
      .eq('user_id', user.id);

    const contentIds = userContent?.map(content => content.id) || [];
    
    // Generate mock alerts (in production, this would query actual piracy_scans table)
    let allAlerts = generateMockAlerts(user.id, contentIds);

    // Apply filters
    if (severity) {
      allAlerts = allAlerts.filter(alert => alert.severity === severity);
    }

    if (status) {
      allAlerts = allAlerts.filter(alert => alert.status === status);
    }

    if (contentId) {
      allAlerts = allAlerts.filter(alert => alert.contentId === contentId);
    }

    // Apply pagination
    const paginatedAlerts = allAlerts.slice(offset, offset + limit);

    // Calculate summary statistics
    const totalAlerts = allAlerts.length;
    const newAlerts = allAlerts.filter(alert => alert.status === 'new').length;
    const highRiskAlerts = allAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length;
    const resolvedAlerts = allAlerts.filter(alert => alert.status === 'resolved').length;
    const matchScores = allAlerts.map(alert => alert.matchScore);
    const averageMatchScore = matchScores.length > 0 
      ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
      : 0;

    const response: AlertsResponse = {
      alerts: paginatedAlerts,
      pagination: {
        total: totalAlerts,
        page,
        limit,
        hasNext: offset + limit < totalAlerts,
        hasPrev: page > 1,
      },
      summary: {
        totalAlerts,
        newAlerts,
        highRiskAlerts,
        resolvedAlerts,
        averageMatchScore,
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
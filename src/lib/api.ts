import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Base function to call Supabase Edge Functions
async function callEdgeFunction<T>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    params?: Record<string, string>;
  } = {}
): Promise<{ data: T | null; error: any }> {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { method = 'GET', body, params } = options;
    
    // Build URL with query parameters
    let url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${session.data.session.access_token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { data: null, error: errorData };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

// Assets API
export interface AssetResponse {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  fileSize: number;
  contentHash: string;
  status: 'processing' | 'protected' | 'failed' | 'pending' | 'revoked';
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

export interface AssetListResponse {
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

export const assetsAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => callEdgeFunction<AssetListResponse>('assets', { params: params as Record<string, string> }),
  
  revoke: (assetId: string, options?: { reason?: string; notifyOwner?: boolean }) =>
    callEdgeFunction(`revoke-asset/${assetId}`, { method: 'DELETE', body: options }),
};

// Alerts API
export interface PiracyAlert {
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

export interface AlertsResponse {
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

export const alertsAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
    contentId?: string;
  }) => callEdgeFunction<AlertsResponse>('alerts', { params: params as Record<string, string> }),
};

// Certificates API
export interface CertificateResponse {
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

export interface CertificatesResponse {
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

export const certificatesAPI = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => callEdgeFunction<CertificatesResponse>('certificates', { params: params as Record<string, string> }),
};

// Unified Dashboard API
export const dashboardAPI = {
  assets: assetsAPI,
  alerts: alertsAPI,
  certificates: certificatesAPI,
}; 
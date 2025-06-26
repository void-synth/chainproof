# ChainProof Dashboard API Endpoints

This document describes the backend API endpoints for the ChainProof dashboard data functionality. All endpoints are implemented as Supabase Edge Functions and require authentication.

## Overview

The dashboard API provides four main endpoints:

1. **GET /assets** - Retrieve user-protected content
2. **GET /alerts** - Retrieve piracy match logs  
3. **GET /certificates** - Retrieve issued certificates
4. **DELETE /asset/:id** - Revoke asset protection

## Authentication

All endpoints require a valid Supabase session token passed in the `Authorization` header:

```
Authorization: Bearer <supabase_access_token>
```

## API Endpoints

### 1. GET /assets

Returns a paginated list of user-protected content with detailed metadata.

**URL:** `https://your-project.supabase.co/functions/v1/assets`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (`processing`, `protected`, `failed`, `pending`, `revoked`)
- `search` (optional): Search in title and description
- `sortBy` (optional): Sort field (default: `created_at`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Response:**
```json
{
  "assets": [
    {
      "id": "uuid",
      "title": "My Document.pdf",
      "description": "Important business document",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "contentHash": "sha256:abc123...",
      "status": "protected",
      "protectionScore": 95,
      "blockchain": {
        "hash": "0xabc123...",
        "network": "ethereum",
        "timestamp": "2025-01-26T10:30:00Z"
      },
      "ipfs": {
        "hash": "QmAbc123...",
        "url": "https://ipfs.io/ipfs/QmAbc123..."
      },
      "downloadUrl": "https://...",
      "isWatermarked": true,
      "createdAt": "2025-01-26T10:00:00Z",
      "updatedAt": "2025-01-26T10:30:00Z",
      "metadata": {
        "sizeFormatted": "1.02 MB",
        "protectionLevel": "high",
        "isBlockchainVerified": true,
        "isIpfsStored": true
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalAssets": 50,
    "protectedAssets": 45,
    "blockchainVerified": 40,
    "averageProtectionScore": 88
  }
}
```

### 2. GET /alerts

Returns piracy detection alerts and match logs for the user's content.

**URL:** `https://your-project.supabase.co/functions/v1/alerts`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `severity` (optional): Filter by severity (`critical`, `high`, `medium`, `low`)
- `status` (optional): Filter by status (`new`, `investigating`, `resolved`, `false_positive`)
- `contentId` (optional): Filter by specific content ID

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-1",
      "contentId": "content-uuid",
      "contentTitle": "My Protected Document",
      "alertType": "high_risk",
      "severity": "critical",
      "matchScore": 85,
      "suspiciousUrl": "https://piracy-site.com/download/12345",
      "sourceType": "torrent",
      "detectionMethod": "ai_scan",
      "description": "Unauthorized distribution detected",
      "status": "new",
      "resolvedAt": null,
      "resolvedBy": null,
      "createdAt": "2025-01-26T12:00:00Z",
      "metadata": {
        "similarityDetails": {
          "visualSimilarity": 85,
          "textSimilarity": 90,
          "structuralSimilarity": 80
        },
        "aiAnalysis": {
          "confidence": 85,
          "method": "deep_learning_comparison",
          "processingTime": 2500
        },
        "screenshotUrl": "https://chainproof-screenshots.s3.amazonaws.com/alert-1.png"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalAlerts": 25,
    "newAlerts": 8,
    "highRiskAlerts": 12,
    "resolvedAlerts": 10,
    "averageMatchScore": 78
  }
}
```

### 3. GET /certificates

Returns issued copyright protection certificates.

**URL:** `https://your-project.supabase.co/functions/v1/certificates`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (`active`, `revoked`, `expired`)
- `search` (optional): Search in asset title, owner name, or certificate ID
- `sortBy` (optional): Sort field (default: `created_at`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Response:**
```json
{
  "certificates": [
    {
      "id": "uuid",
      "certificateId": "CERT-2025-0001",
      "ownerName": "John Doe",
      "assetTitle": "Original Artwork",
      "contentHash": "sha256:def456...",
      "protectionDate": "2025-01-26",
      "assetType": "image/png",
      "fileSize": 2048000,
      "protectionScore": 92,
      "blockchain": {
        "hash": "0xdef456...",
        "network": "polygon",
        "timestamp": "2025-01-26T14:00:00Z"
      },
      "ipfs": {
        "hash": "QmDef456...",
        "url": "https://ipfs.io/ipfs/QmDef456...",
        "uri": "ipfs://QmDef456..."
      },
      "downloadUrl": "https://chainproof.s3.amazonaws.com/cert-2025-0001.pdf",
      "verificationUrl": "https://chainproof.io/verify/CERT-2025-0001",
      "status": "active",
      "verificationCount": 15,
      "lastVerifiedAt": "2025-01-26T16:30:00Z",
      "emailSent": true,
      "emailSentAt": "2025-01-26T14:05:00Z",
      "recipientEmail": "john@example.com",
      "createdAt": "2025-01-26T14:00:00Z",
      "updatedAt": "2025-01-26T16:30:00Z",
      "metadata": {
        "sizeFormatted": "2.05 MB",
        "isBlockchainVerified": true,
        "isIpfsStored": true,
        "daysSinceIssued": 1
      }
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalCertificates": 30,
    "activeCertificates": 28,
    "revokedCertificates": 2,
    "totalVerifications": 450,
    "averageProtectionScore": 89,
    "blockchainVerifiedCount": 30
  }
}
```

### 4. DELETE /asset/:id

Revokes protection for a specific asset and associated certificates.

**URL:** `https://your-project.supabase.co/functions/v1/revoke-asset/{assetId}`

**Method:** DELETE

**Request Body (optional):**
```json
{
  "reason": "User requested removal",
  "notifyOwner": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset 'My Document.pdf' has been successfully revoked",
  "assetId": "uuid",
  "revokedAt": "2025-01-26T18:00:00Z",
  "data": {
    "previousStatus": "protected",
    "certificatesRevoked": 2,
    "blockchainUpdateRequired": true,
    "ipfsRemovalRequired": true
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found (asset/resource doesn't exist)
- `400` - Bad request (invalid parameters)
- `500` - Internal server error

## Client Usage

Use the provided API client in `src/lib/api.ts`:

```typescript
import { dashboardAPI } from '@/lib/api';

// Get assets
const { data: assetsData, error } = await dashboardAPI.assets.list({
  page: 1,
  limit: 20,
  status: 'protected'
});

// Get alerts
const { data: alertsData, error } = await dashboardAPI.alerts.list({
  severity: 'high',
  status: 'new'
});

// Get certificates
const { data: certificatesData, error } = await dashboardAPI.certificates.list({
  status: 'active'
});

// Revoke asset
const { data: revokeData, error } = await dashboardAPI.assets.revoke('asset-id', {
  reason: 'User requested',
  notifyOwner: true
});
```

## Deployment

Deploy the Edge Functions using the Supabase CLI:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy assets
supabase functions deploy alerts
supabase functions deploy certificates
supabase functions deploy revoke-asset

# Set environment variables
supabase secrets set OPENAI_API_KEY=your_openai_key
supabase secrets set GOOGLE_SEARCH_API_KEY=your_google_key
```

## Development

For local development:

```bash
# Start Supabase locally
supabase start

# Run specific function locally
supabase functions serve assets --env-file .env.local
```

## Security

- All endpoints enforce Row Level Security (RLS)
- Users can only access their own data
- Activity logging for audit trails
- Rate limiting applied via Supabase Edge Functions
- CORS headers configured for web app access

## Database Schema

The endpoints use these main tables:
- `content` - Protected assets/content
- `certificates` - Issued protection certificates  
- `piracy_scans` - Piracy detection scan results
- `activity_logs` - Audit trail for user actions

Refer to the migration files in `supabase/migrations/` for complete schema details. 
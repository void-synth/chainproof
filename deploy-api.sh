#!/bin/bash

# ChainProof Dashboard API Deployment Script
echo "🚀 Deploying ChainProof Dashboard API Endpoints..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Apply database migrations
echo "📊 Applying database migrations..."
supabase db push

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."

# Deploy individual functions
echo "  • Deploying assets endpoint..."
supabase functions deploy assets

echo "  • Deploying alerts endpoint..."
supabase functions deploy alerts

echo "  • Deploying certificates endpoint..."
supabase functions deploy certificates

echo "  • Deploying revoke-asset endpoint..."
supabase functions deploy revoke-asset

# Set environment variables (if not already set)
echo "🔧 Setting environment variables..."
echo "  Note: Make sure to set the following secrets if not already done:"
echo "  - OPENAI_API_KEY (for AI analysis)"
echo "  - GOOGLE_SEARCH_API_KEY (for web search)"

echo ""
echo "✅ Dashboard API deployment complete!"
echo ""
echo "📚 Available endpoints:"
echo "  • GET  /functions/v1/assets"
echo "  • GET  /functions/v1/alerts"
echo "  • GET  /functions/v1/certificates"
echo "  • DELETE /functions/v1/revoke-asset/{id}"
echo ""
echo "📖 See docs/API_ENDPOINTS.md for detailed documentation" 
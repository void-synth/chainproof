import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PiracyScanDialog } from './PiracyScanDialog';
import { Shield, Search, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export const PiracyScanDemo: React.FC = () => {
  // Mock scan result for demo
  const mockScanResult = {
    scanId: 'demo-scan-12345',
    overallRisk: 'medium' as const,
    confidenceScore: 75,
    matches: [
      {
        url: 'https://suspicious-downloads.com/your-content',
        title: 'Free Download - Your Content',
        snippet: 'Download this content for free! No registration required.',
        similarity: 85,
        riskLevel: 'high' as const,
        matchType: 'similar' as const,
        confidence: 80,
        details: {
          source: 'file-sharing' as const,
          lastSeen: new Date().toISOString(),
          accessType: 'public' as const
        }
      },
      {
        url: 'https://torrent-hub.net/content-123',
        title: 'Torrent: Similar Content Available',
        snippet: 'Torrent file available for download. High speed, verified.',
        similarity: 65,
        riskLevel: 'medium' as const,
        matchType: 'suspicious' as const,
        confidence: 70,
        details: {
          source: 'torrent' as const,
          lastSeen: new Date().toISOString(),
          accessType: 'public' as const
        }
      }
    ],
    summary: 'Demo scan detected 2 potential piracy matches with moderate risk of unauthorized distribution.',
    recommendations: [
      '👀 Monitor these sites regularly for changes',
      '📝 Document all evidence for potential legal action',
      '🛡️ Enable blockchain timestamping for stronger IP proof'
    ],
    scanDetails: {
      contentHash: 'a1b2c3d4e5f6...',
      contentType: 'application/pdf',
      scanTimestamp: new Date().toISOString(),
      searchQueries: ['demo query 1', 'demo query 2'],
      aiAnalysis: 'Demo AI analysis completed'
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          AI Piracy Detection System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner Interface */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Content Analysis</p>
                  <p className="text-sm text-gray-600">Extract file hash, metadata, and generate search queries</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Web Search</p>
                  <p className="text-sm text-gray-600">Scan search engines and known piracy sites</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium">AI Analysis</p>
                  <p className="text-sm text-gray-600">Use GPT to analyze similarity and threat level</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-red-600">4</span>
                </div>
                <div>
                  <p className="font-medium">Generate Report</p>
                  <p className="text-sm text-gray-600">Provide risk assessment and actionable recommendations</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <PiracyScanDialog
                trigger={
                  <Button className="w-full gap-2">
                    <Search className="h-4 w-4" />
                    Start Piracy Scan
                  </Button>
                }
              />
            </div>
          </div>

          {/* Demo Results */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Sample Scan Results</h3>
            
            {/* Summary */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Risk Assessment</span>
                <Badge 
                  variant="outline" 
                  className={`gap-2 ${getRiskColor(mockScanResult.overallRisk)} text-white`}
                >
                  {getRiskIcon(mockScanResult.overallRisk)}
                  {mockScanResult.overallRisk.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{mockScanResult.confidenceScore}%</div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{mockScanResult.matches.length}</div>
                  <div className="text-xs text-gray-500">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {mockScanResult.matches.filter(m => m.riskLevel === 'high').length}
                  </div>
                  <div className="text-xs text-gray-500">High Risk</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{mockScanResult.summary}</p>
            </div>

            {/* Sample Matches */}
            <div className="space-y-2">
              <h4 className="font-medium">Potential Matches Found</h4>
              {mockScanResult.matches.slice(0, 2).map((match, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline"
                          className={`${getRiskColor(match.riskLevel)} text-white text-xs`}
                        >
                          {match.riskLevel.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {match.similarity}% match
                        </Badge>
                      </div>
                      <h5 className="font-medium text-sm truncate">{match.title}</h5>
                      <p className="text-xs text-gray-600 line-clamp-2">{match.snippet}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-1 flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {mockScanResult.recommendations.slice(0, 2).map((rec, index) => (
                  <li key={index} className="text-xs flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
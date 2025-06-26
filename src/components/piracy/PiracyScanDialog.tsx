import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePiracyScanner } from '@/hooks/use-piracy-scanner';
import { Shield, Search, Upload, Hash, AlertTriangle, CheckCircle, ExternalLink, Clock, Download } from 'lucide-react';

interface PiracyScanDialogProps {
  trigger?: React.ReactNode;
  onScanComplete?: (result: any) => void;
}

export const PiracyScanDialog: React.FC<PiracyScanDialogProps> = ({ 
  trigger, 
  onScanComplete 
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState('');
  const [contentType, setContentType] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    keywords: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isScanning,
    scanProgress,
    scanStage,
    result,
    error,
    scanFile,
    scanHash,
    clearResults
  } = usePiracyScanner();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMetadata(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, '') // Remove extension
      }));
    }
  };

  const handleFileScan = async () => {
    if (!selectedFile) return;
    
    try {
      const keywords = metadata.keywords.split(',').map(k => k.trim()).filter(k => k);
      const result = await scanFile(selectedFile, {
        title: metadata.title,
        description: metadata.description,
        keywords
      });
      
      onScanComplete?.(result);
    } catch (error) {
      console.error('File scan failed:', error);
    }
  };

  const handleHashScan = async () => {
    if (!hashInput || !contentType) return;
    
    try {
      const keywords = metadata.keywords.split(',').map(k => k.trim()).filter(k => k);
      const result = await scanHash(hashInput, contentType, {
        title: metadata.title,
        description: metadata.description,
        keywords
      });
      
      onScanComplete?.(result);
    } catch (error) {
      console.error('Hash scan failed:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Scan for Piracy
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Piracy Detection Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scanning Interface */}
          {!result && (
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="gap-2">
                  <Upload className="h-4 w-4" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="hash" className="gap-2">
                  <Hash className="h-4 w-4" />
                  Hash Lookup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload File for Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Select File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="*/*"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Content Title</Label>
                        <Input
                          id="title"
                          value={metadata.title}
                          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter content title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                        <Input
                          id="keywords"
                          value={metadata.keywords}
                          onChange={(e) => setMetadata(prev => ({ ...prev, keywords: e.target.value }))}
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the content"
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleFileScan}
                      disabled={!selectedFile || isScanning}
                      className="w-full gap-2"
                    >
                      <Search className="h-4 w-4" />
                      {isScanning ? 'Scanning...' : 'Start Piracy Scan'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hash" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Hash-Based Lookup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="hash-input">File Hash (SHA-256)</Label>
                      <Input
                        id="hash-input"
                        value={hashInput}
                        onChange={(e) => setHashInput(e.target.value)}
                        placeholder="Enter SHA-256 hash"
                        className="font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="content-type">Content Type</Label>
                        <Input
                          id="content-type"
                          value={contentType}
                          onChange={(e) => setContentType(e.target.value)}
                          placeholder="e.g., image/jpeg, application/pdf"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hash-title">Content Title</Label>
                        <Input
                          id="hash-title"
                          value={metadata.title}
                          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter content title"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hash-keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="hash-keywords"
                        value={metadata.keywords}
                        onChange={(e) => setMetadata(prev => ({ ...prev, keywords: e.target.value }))}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    <Button 
                      onClick={handleHashScan}
                      disabled={!hashInput || !contentType || isScanning}
                      className="w-full gap-2"
                    >
                      <Hash className="h-4 w-4" />
                      {isScanning ? 'Scanning...' : 'Lookup Hash'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Scanning Progress */}
          {isScanning && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Scanning Progress</span>
                    <span className="text-sm text-muted-foreground">{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Search className="h-4 w-4 animate-spin" />
                    {scanStage}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Scan Results</span>
                    <Badge 
                      variant="outline" 
                      className={`gap-2 ${getRiskColor(result.overallRisk)} text-white`}
                    >
                      {getRiskIcon(result.overallRisk)}
                      {result.overallRisk.toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.confidenceScore}%</div>
                      <div className="text-sm text-muted-foreground">Confidence Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.matches.length}</div>
                      <div className="text-sm text-muted-foreground">Potential Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.matches.filter(m => m.riskLevel === 'high' || m.riskLevel === 'critical').length}
                      </div>
                      <div className="text-sm text-muted-foreground">High-Risk Matches</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>

                  {/* Scan Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Content Hash:</span>
                      <div className="font-mono text-xs break-all">{result.scanDetails.contentHash}</div>
                    </div>
                    <div>
                      <span className="font-medium">Scan Time:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(result.scanDetails.scanTimestamp)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matches */}
              {result.matches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Potential Piracy Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.matches.map((match, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="outline"
                                  className={`${getRiskColor(match.riskLevel)} text-white`}
                                >
                                  {match.riskLevel.toUpperCase()}
                                </Badge>
                                <Badge variant="secondary">
                                  {match.similarity}% match
                                </Badge>
                                <Badge variant="outline">
                                  {match.details.source}
                                </Badge>
                              </div>
                              
                              <h5 className="font-medium mb-1">{match.title}</h5>
                              <p className="text-sm text-muted-foreground mb-2">{match.snippet}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Confidence: {match.confidence}%</span>
                                <span>Type: {match.matchType}</span>
                                <span>Access: {match.details.accessType}</span>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(match.url, '_blank')}
                              className="gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  New Scan
                </Button>
                <Button 
                  onClick={() => {
                    const dataStr = JSON.stringify(result, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `piracy-scan-${result.scanId}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
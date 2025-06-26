import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCertificateGenerator } from '@/hooks/use-certificate-generator';
import { CertificateData } from '@/lib/certificate-generator';
import { 
  Award, 
  Download, 
  QrCode, 
  ExternalLink, 
  FileText,
  Shield,
  Clock,
  Hash,
  Sparkles
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function CertificateDemo() {
  const { toast } = useToast();
  const {
    isGenerating,
    generationProgress,
    generationStage,
    result,
    error,
    generateCertificate,
    downloadCertificate,
    clearResult
  } = useCertificateGenerator();

  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demoData: Record<string, CertificateData> = {
    artwork: {
      ownerName: "Sarah Williams",
      assetTitle: "Digital Sunset Landscape",
      contentHash: "sha256:d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
      protectionDate: new Date().toISOString(),
      assetType: "Digital Artwork",
      fileSize: 2450000,
      protectionScore: 95,
      blockchainHash: "0x742d35cc6b8b4532f15a5b6e8a9f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a09",
      blockchainNetwork: "Polygon Mumbai",
      blockchainTimestamp: new Date().toISOString(),
      ipfsHash: "QmArtworkSunsetLandscape2024DemoHash",
      ipfsUrl: "https://ipfs.io/ipfs/QmArtworkSunsetLandscape2024DemoHash"
    },
    document: {
      ownerName: "Michael Chen",
      assetTitle: "Technical Research Paper - AI in Blockchain",
      contentHash: "sha256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
      protectionDate: new Date().toISOString(),
      assetType: "Research Document",
      fileSize: 1200000,
      protectionScore: 88,
      blockchainHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      blockchainNetwork: "Polygon Mumbai",
      blockchainTimestamp: new Date().toISOString(),
    },
    video: {
      ownerName: "Creative Studio XYZ",
      assetTitle: "Brand Commercial - Future Vision 2024",
      contentHash: "sha256:b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
      protectionDate: new Date().toISOString(),
      assetType: "Video Content",
      fileSize: 45000000,
      protectionScore: 92,
      blockchainHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      blockchainNetwork: "Polygon Mumbai",
      blockchainTimestamp: new Date().toISOString(),
      ipfsHash: "QmVideoCommercialFutureVision2024Hash",
      ipfsUrl: "https://ipfs.io/ipfs/QmVideoCommercialFutureVision2024Hash"
    }
  };

  const handleGenerateDemo = async (type: string) => {
    setActiveDemo(type);
    
    try {
      const data = demoData[type];
      await generateCertificate(data);
      
      toast({
        title: "Demo Certificate Generated! 🏆",
        description: `${data.assetTitle} certificate is ready`,
      });
    } catch (error: any) {
      toast({
        title: "Demo Failed",
        description: error.message || "Failed to generate demo certificate",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadCertificate(result);
      toast({
        title: "Certificate Downloaded",
        description: "Demo certificate PDF has been downloaded",
      });
    }
  };

  const handleNewDemo = () => {
    clearResult();
    setActiveDemo(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Certificate Generation Demo
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          Experience our PDF certificate generation with QR code verification
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!result ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Try generating a certificate for:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Digital Artwork */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300">
                <CardContent className="p-4" onClick={() => handleGenerateDemo('artwork')}>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Digital Artwork</h4>
                      <p className="text-sm text-gray-600 mb-2">Sunset Landscape</p>
                      <Badge variant="outline" className="text-xs">2.5 MB • PNG</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={isGenerating && activeDemo === 'artwork'}
                    >
                      {isGenerating && activeDemo === 'artwork' ? 'Generating...' : 'Generate Certificate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Research Document */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300">
                <CardContent className="p-4" onClick={() => handleGenerateDemo('document')}>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Research Paper</h4>
                      <p className="text-sm text-gray-600 mb-2">AI in Blockchain</p>
                      <Badge variant="outline" className="text-xs">1.2 MB • PDF</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={isGenerating && activeDemo === 'document'}
                    >
                      {isGenerating && activeDemo === 'document' ? 'Generating...' : 'Generate Certificate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Video Commercial */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300">
                <CardContent className="p-4" onClick={() => handleGenerateDemo('video')}>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Video Commercial</h4>
                      <p className="text-sm text-gray-600 mb-2">Future Vision 2024</p>
                      <Badge variant="outline" className="text-xs">45 MB • MP4</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={isGenerating && activeDemo === 'video'}
                    >
                      {isGenerating && activeDemo === 'video' ? 'Generating...' : 'Generate Certificate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Generating Certificate</span>
                      <span className="text-sm text-gray-600">{generationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {generationStage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">Certificate Generated Successfully!</h3>
                <p className="text-gray-600">Your protection certificate is ready for download</p>
              </div>
            </div>

            {/* Certificate Info */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Certificate ID:</span>
                    <code className="block text-xs bg-gray-100 p-2 rounded mt-1">
                      {result.certificateId}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">File Size:</span>
                    <p className="font-mono">{formatFileSize(result.metadata.fileSize)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <span className="text-gray-500 text-sm">Verification URL:</span>
                  <code className="block text-xs bg-gray-100 p-2 rounded break-all">
                    {result.verificationUrl}
                  </code>
                </div>

                {result.ipfsUri && (
                  <div className="mt-4 space-y-2">
                    <span className="text-gray-500 text-sm">IPFS URI:</span>
                    <code className="block text-xs bg-gray-100 p-2 rounded">
                      {result.ipfsUri}
                    </code>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">QR Code verification included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Blockchain verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download Certificate
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(result.verificationUrl, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Verify Online
              </Button>
              <Button variant="outline" onClick={handleNewDemo}>
                Try Another Demo
              </Button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="bg-white/50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-gray-800">Certificate Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" />
              <span>SHA-256 content fingerprint</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-green-600" />
              <span>QR code for instant verification</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Blockchain timestamp proof</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <span>Professional PDF certificate</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
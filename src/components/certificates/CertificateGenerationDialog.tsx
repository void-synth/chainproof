import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCertificateGenerator } from '@/hooks/use-certificate-generator';
import { CertificateData } from '@/lib/certificate-generator';
import { 
  FileText, 
  Download, 
  Mail, 
  QrCode, 
  Shield, 
  Clock, 
  Hash, 
  Globe,
  Award,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CertificateGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledData?: Partial<CertificateData>;
}

export function CertificateGenerationDialog({ 
  open, 
  onOpenChange,
  prefilledData 
}: CertificateGenerationDialogProps) {
  const { toast } = useToast();
  const {
    isGenerating,
    generationProgress,
    generationStage,
    result,
    error,
    generateCertificate,
    emailCertificate,
    downloadCertificate,
    clearResult
  } = useCertificateGenerator();

  const [formData, setFormData] = useState<CertificateData>({
    ownerName: '',
    assetTitle: '',
    contentHash: '',
    protectionDate: new Date().toISOString(),
    ...prefilledData
  });

  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: 'Your ChainProof Protection Certificate',
    message: 'Thank you for protecting your digital assets with ChainProof!'
  });

  const [isEmailSending, setIsEmailSending] = useState(false);

  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({ ...prev, ...prefilledData }));
    }
  }, [prefilledData]);

  const handleInputChange = (field: keyof CertificateData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    try {
      if (!formData.ownerName || !formData.assetTitle || !formData.contentHash) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      await generateCertificate(formData);
      
      toast({
        title: "Certificate Generated! 🏆",
        description: "Your protection certificate has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate certificate",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadCertificate(result);
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate PDF has been downloaded.",
      });
    }
  };

  const handleEmail = async () => {
    if (!result || !emailData.recipientEmail) {
      toast({
        title: "Email Error",
        description: "Please enter a recipient email address.",
        variant: "destructive"
      });
      return;
    }

    setIsEmailSending(true);
    try {
      const success = await emailCertificate(result, emailData);
      
      if (success) {
        toast({
          title: "Certificate Emailed! 📧",
          description: `Certificate sent to ${emailData.recipientEmail}`,
        });
      } else {
        throw new Error('Email sending failed');
      }
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send certificate email",
        variant: "destructive"
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const openVerificationUrl = () => {
    if (result) {
      window.open(result.verificationUrl, '_blank');
    }
  };

  const handleClose = () => {
    clearResult();
    onOpenChange(false);
  };

  const isFormValid = formData.ownerName && formData.assetTitle && formData.contentHash;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Generate Protection Certificate
          </DialogTitle>
          <DialogDescription>
            Create a verifiable PDF certificate with QR code for your protected digital asset
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate" disabled={isGenerating}>
              <FileText className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="result" disabled={!result}>
              <Award className="w-4 h-4 mr-2" />
              Certificate
            </TabsTrigger>
            <TabsTrigger value="delivery" disabled={!result}>
              <Mail className="w-4 h-4 mr-2" />
              Delivery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certificate Information</CardTitle>
                <CardDescription>
                  Enter the details for your protection certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      placeholder="Your full name"
                      disabled={isGenerating}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assetTitle">Asset Title *</Label>
                    <Input
                      id="assetTitle"
                      value={formData.assetTitle}
                      onChange={(e) => handleInputChange('assetTitle', e.target.value)}
                      placeholder="Name of your digital asset"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentHash">Content Hash *</Label>
                  <Input
                    id="contentHash"
                    value={formData.contentHash}
                    onChange={(e) => handleInputChange('contentHash', e.target.value)}
                    placeholder="SHA-256 hash of your content"
                    disabled={isGenerating}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetType">Asset Type</Label>
                    <Input
                      id="assetType"
                      value={formData.assetType || ''}
                      onChange={(e) => handleInputChange('assetType', e.target.value)}
                      placeholder="e.g., Document, Image, Video"
                      disabled={isGenerating}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="protectionScore">Protection Score (%)</Label>
                    <Input
                      id="protectionScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.protectionScore || ''}
                      onChange={(e) => handleInputChange('protectionScore', parseInt(e.target.value))}
                      placeholder="85"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Blockchain Information */}
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Blockchain Verification (Optional)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blockchainHash">Transaction Hash</Label>
                      <Input
                        id="blockchainHash"
                        value={formData.blockchainHash || ''}
                        onChange={(e) => handleInputChange('blockchainHash', e.target.value)}
                        placeholder="0x..."
                        disabled={isGenerating}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="blockchainNetwork">Network</Label>
                      <Input
                        id="blockchainNetwork"
                        value={formData.blockchainNetwork || ''}
                        onChange={(e) => handleInputChange('blockchainNetwork', e.target.value)}
                        placeholder="Polygon Mumbai"
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                </div>

                {/* IPFS Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    IPFS Storage (Optional)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ipfsHash">IPFS Hash</Label>
                      <Input
                        id="ipfsHash"
                        value={formData.ipfsHash || ''}
                        onChange={(e) => handleInputChange('ipfsHash', e.target.value)}
                        placeholder="Qm..."
                        disabled={isGenerating}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ipfsUrl">Gateway URL</Label>
                      <Input
                        id="ipfsUrl"
                        value={formData.ipfsUrl || ''}
                        onChange={(e) => handleInputChange('ipfsUrl', e.target.value)}
                        placeholder="https://ipfs.io/ipfs/..."
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Generating Certificate</span>
                      <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      {generationStage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Generation Failed</span>
                  </div>
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={!isFormValid || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                Generate Certificate
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="result" className="space-y-6">
            {result && (
              <>
                {/* Certificate Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      Certificate Generated Successfully
                    </CardTitle>
                    <CardDescription>
                      Your protection certificate is ready for download and verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Certificate ID</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.certificateId, 'Certificate ID')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <code className="text-xs bg-muted p-2 rounded block">
                          {result.certificateId}
                        </code>
                      </div>
                      
                      <div className="space-y-3">
                        <span className="text-sm font-medium">File Size</span>
                        <p className="text-sm text-muted-foreground">
                          {(result.metadata.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Verification URL</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.verificationUrl, 'Verification URL')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={openVerificationUrl}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <code className="text-xs bg-muted p-2 rounded block break-all">
                        {result.verificationUrl}
                      </code>
                    </div>

                    {result.ipfsUri && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">IPFS URI</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.ipfsUri!, 'IPFS URI')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <code className="text-xs bg-muted p-2 rounded block">
                          {result.ipfsUri}
                        </code>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4">
                      <QrCode className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">QR Code Verification</p>
                        <p className="text-xs text-muted-foreground">
                          Contains certificate data and verification URL
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Download Actions */}
                <div className="flex justify-center gap-4">
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </Button>
                  <Button variant="outline" onClick={openVerificationUrl} className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Verify Online
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Certificate
                  </CardTitle>
                  <CardDescription>
                    Send the certificate PDF via email with a professional template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientEmail">Recipient Email *</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        value={emailData.recipientEmail}
                        onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                        placeholder="recipient@example.com"
                        disabled={isEmailSending}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        id="recipientName"
                        value={emailData.recipientName}
                        onChange={(e) => setEmailData(prev => ({ ...prev, recipientName: e.target.value }))}
                        placeholder="Recipient's full name"
                        disabled={isEmailSending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailSubject">Email Subject</Label>
                    <Input
                      id="emailSubject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      disabled={isEmailSending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailMessage">Custom Message</Label>
                    <Textarea
                      id="emailMessage"
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Add a personal message..."
                      rows={3}
                      disabled={isEmailSending}
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Email Preview</h4>
                    <p className="text-xs text-muted-foreground">
                      The email will include a professional template with your custom message,
                      certificate details, QR code, and the PDF attachment.
                    </p>
                  </div>

                  <Button 
                    onClick={handleEmail} 
                    disabled={!emailData.recipientEmail || isEmailSending}
                    className="w-full gap-2"
                  >
                    {isEmailSending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Send Certificate
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 
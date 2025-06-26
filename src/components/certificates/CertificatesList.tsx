import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCertificateGenerator, UserCertificate } from '@/hooks/use-certificate-generator';
import { 
  Award, 
  Download, 
  ExternalLink, 
  Eye, 
  Calendar, 
  Hash, 
  MoreVertical,
  Copy,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface CertificatesListProps {
  onGenerateNew?: () => void;
}

export function CertificatesList({ onGenerateNew }: CertificatesListProps) {
  const { toast } = useToast();
  const {
    certificates,
    isLoadingCertificates,
    loadUserCertificates,
    verifyCertificate,
    revokeCertificate,
    activeCertificates,
    revokedCertificates,
    totalVerifications
  } = useCertificateGenerator();

  const [verifyingCertificates, setVerifyingCertificates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserCertificates();
  }, [loadUserCertificates]);

  const handleVerify = async (certificateId: string) => {
    setVerifyingCertificates(prev => new Set(prev).add(certificateId));
    
    try {
      const result = await verifyCertificate(certificateId);
      
      if (result.valid) {
        toast({
          title: "Certificate Verified ✅",
          description: "Certificate is valid and authentic",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Certificate could not be verified",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify certificate",
        variant: "destructive"
      });
    } finally {
      setVerifyingCertificates(prev => {
        const newSet = new Set(prev);
        newSet.delete(certificateId);
        return newSet;
      });
    }
  };

  const handleRevoke = async (certificateId: string) => {
    const reason = prompt('Enter revocation reason:');
    if (!reason) return;

    const success = await revokeCertificate(certificateId, reason);
    
    if (success) {
      toast({
        title: "Certificate Revoked",
        description: "Certificate has been successfully revoked",
      });
    } else {
      toast({
        title: "Revocation Failed",
        description: "Failed to revoke certificate",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'revoked':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Revoked</Badge>;
      case 'expired':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const CertificateCard = ({ certificate }: { certificate: UserCertificate }) => (
    <Card key={certificate.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              {certificate.assetTitle}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>Owner: {certificate.ownerName}</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(certificate.createdAt), { addSuffix: true })}
              </span>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(certificate.status)}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Certificate Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => openUrl(certificate.downloadUrl)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => openUrl(certificate.verificationUrl)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verify Online
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleVerify(certificate.certificateId)}
                  disabled={verifyingCertificates.has(certificate.certificateId)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {verifyingCertificates.has(certificate.certificateId) ? 'Verifying...' : 'Quick Verify'}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => copyToClipboard(certificate.certificateId, 'Certificate ID')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy ID
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => copyToClipboard(certificate.verificationUrl, 'Verification URL')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                
                {certificate.status === 'active' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleRevoke(certificate.certificateId)}
                      className="text-red-600"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Revoke Certificate
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Certificate ID:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(certificate.certificateId, 'Certificate ID')}
                className="h-auto p-1 text-xs"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <code className="text-xs bg-muted p-2 rounded block">
              {certificate.certificateId}
            </code>
          </div>
          
          <div className="space-y-2">
            <span className="text-muted-foreground">Content Hash:</span>
            <code className="text-xs bg-muted p-2 rounded block">
              <Hash className="w-3 h-3 inline mr-1" />
              {certificate.contentHash.substring(0, 20)}...
            </code>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Protected: {new Date(certificate.protectionDate).toLocaleDateString()}
            </span>
            
            {certificate.verificationCount > 0 && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {certificate.verificationCount} verification{certificate.verificationCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openUrl(certificate.downloadUrl)}
              className="gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => openUrl(certificate.verificationUrl)}
              className="gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Verify
            </Button>
          </div>
        </div>

        {certificate.ipfsUri && (
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">IPFS URI:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted p-2 rounded flex-1">
                {certificate.ipfsUri}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(certificate.ipfsUri!, 'IPFS URI')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoadingCertificates) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading certificates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{certificates.length}</p>
                <p className="text-xs text-muted-foreground">Total Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeCertificates.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalVerifications}</p>
                <p className="text-xs text-muted-foreground">Verifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{revokedCertificates.length}</p>
                <p className="text-xs text-muted-foreground">Revoked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Generate your first protection certificate to establish verifiable proof 
              of your digital asset ownership and protection.
            </p>
            {onGenerateNew && (
              <Button onClick={onGenerateNew} className="gap-2">
                <Award className="w-4 h-4" />
                Generate Certificate
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Certificates</h3>
            {onGenerateNew && (
              <Button onClick={onGenerateNew} variant="outline" className="gap-2">
                <Award className="w-4 h-4" />
                Generate New
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {certificates.map(certificate => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
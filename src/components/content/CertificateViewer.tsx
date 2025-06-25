import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QRCode from "qrcode.react";

interface CertificateViewerProps {
  content: {
    id: string;
    title: string;
    type: string;
    created_at: string;
    blockchain_verification: {
      hash: string;
      timestamp: number;
      owner: string;
      transaction_hash: string;
      block_number: number;
    };
    ipfs_details: {
      hash: string;
      gateway_url: string;
      pinned_at: string;
    };
    certificate_status: "Issued" | "Pending" | "Expired";
  };
}

export default function CertificateViewer({ content }: CertificateViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: message,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try again",
      });
    }
  };

  const downloadCertificate = () => {
    const certificateData = {
      id: content.id,
      title: content.title,
      type: content.type,
      issuedAt: content.created_at,
      blockchain: {
        hash: content.blockchain_verification.hash,
        timestamp: content.blockchain_verification.timestamp,
        owner: content.blockchain_verification.owner,
        transaction: content.blockchain_verification.transaction_hash,
        block: content.blockchain_verification.block_number,
      },
      ipfs: {
        hash: content.ipfs_details.hash,
        url: content.ipfs_details.gateway_url,
        pinned: content.ipfs_details.pinned_at,
      },
      status: content.certificate_status,
      verificationUrl: \`https://your-domain.com/verify/\${content.id}\`,
    };

    const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`certificate-\${content.id}.json\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatusBadge = () => {
    switch (content.certificate_status) {
      case "Issued":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Valid Certificate
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending Verification
          </Badge>
        );
      case "Expired":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Certificate Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Shield className="h-4 w-4" />
          View Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Blockchain Certificate</DialogTitle>
          <DialogDescription>
            Proof of content protection and ownership
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Certificate Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{content.title}</CardTitle>
                  <CardDescription>
                    Protected on{" "}
                    {format(new Date(content.created_at), "MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <StatusBadge />
              </div>
            </CardHeader>
          </Card>

          {/* Blockchain Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Blockchain Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Content Hash</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {content.blockchain_verification.hash.slice(0, 20)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(
                            content.blockchain_verification.hash,
                            "Content hash copied"
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Transaction Hash</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {content.blockchain_verification.transaction_hash.slice(0, 20)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          window.open(
                            \`https://etherscan.io/tx/\${content.blockchain_verification.transaction_hash}\`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Block Number</span>
                    <div className="mt-1">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {content.blockchain_verification.block_number}
                      </code>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Timestamp</span>
                    <div className="mt-1">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {format(
                          new Date(content.blockchain_verification.timestamp * 1000),
                          "PPpp"
                        )}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IPFS Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Decentralized Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">IPFS Hash</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {content.ipfs_details.hash.slice(0, 20)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        copyToClipboard(
                          content.ipfs_details.hash,
                          "IPFS hash copied"
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        window.open(content.ipfs_details.gateway_url, "_blank")
                      }
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Pinned At</span>
                  <div className="mt-1">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {format(new Date(content.ipfs_details.pinned_at), "PPpp")}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Verification</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <QRCode
                  value={`https://your-domain.com/verify/${content.id}`}
                  size={160}
                  level="H"
                  includeMargin
                />
                <p className="mt-2 text-sm text-gray-500">
                  Scan to verify this certificate
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <CardFooter className="flex justify-between mt-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Info className="h-4 w-4" />
                  Verify Online
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit our verification portal to check certificate validity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={downloadCertificate}
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                copyToClipboard(
                  `https://your-domain.com/verify/${content.id}`,
                  "Verification link copied"
                )
              }
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
} 
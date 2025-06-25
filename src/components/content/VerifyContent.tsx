import { useState } from "react";
import { useBlockchainProtection } from "@/hooks/use-blockchain";
import { useIPFS } from "@/hooks/use-ipfs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  CheckCircle,
  XCircle,
  Search,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

interface VerificationResult {
  isValid: boolean;
  contentDetails?: {
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
  };
  error?: string;
}

export default function VerifyContent() {
  const [contentId, setContentId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const { verifyContent } = useBlockchainProtection();

  const handleVerify = async () => {
    if (!contentId) return;

    setIsVerifying(true);
    setResult(null);

    try {
      // Fetch content details from your API
      const response = await fetch(`/api/content/${contentId}`);
      const content = await response.json();

      if (!content) {
        setResult({
          isValid: false,
          error: "Content not found",
        });
        return;
      }

      // Verify on blockchain
      const blockchainVerification = await verifyContent.mutateAsync({
        contentId,
        contentHash: content.blockchain_verification.hash,
      });

      setResult({
        isValid: blockchainVerification.isValid,
        contentDetails: content,
        error: blockchainVerification.isValid ? undefined : "Invalid certificate",
      });
    } catch (error: any) {
      setResult({
        isValid: false,
        error: error.message || "Verification failed",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* Verification Input */}
        <Card>
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
            <CardDescription>
              Enter the content ID or certificate ID to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="contentId">Certificate ID</Label>
                <Input
                  id="contentId"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  placeholder="Enter certificate ID"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleVerify}
                  disabled={!contentId || isVerifying}
                  className="gap-2"
                >
                  {isVerifying ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Verify
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Verification Result</CardTitle>
                {result.isValid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Valid Certificate</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span>{result.error || "Invalid Certificate"}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            {result.isValid && result.contentDetails && (
              <CardContent>
                <div className="space-y-6">
                  {/* Content Details */}
                  <div>
                    <h3 className="font-medium mb-3">Content Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Title</Label>
                        <p className="mt-1">{result.contentDetails.title}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Type</Label>
                        <p className="mt-1">{result.contentDetails.type}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Protected On</Label>
                        <p className="mt-1">
                          {format(
                            new Date(result.contentDetails.created_at),
                            "PPP"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Blockchain Verification */}
                  <div>
                    <h3 className="font-medium mb-3">Blockchain Verification</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Content Hash</Label>
                        <code className="block px-2 py-1 mt-1 bg-gray-100 rounded text-xs font-mono">
                          {result.contentDetails.blockchain_verification.hash}
                        </code>
                      </div>
                      <div>
                        <Label className="text-gray-500">Block Number</Label>
                        <code className="block px-2 py-1 mt-1 bg-gray-100 rounded text-xs font-mono">
                          {result.contentDetails.blockchain_verification.block_number}
                        </code>
                      </div>
                      <div>
                        <Label className="text-gray-500">Transaction</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            {result.contentDetails.blockchain_verification.transaction_hash.slice(0, 20)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              window.open(
                                `https://etherscan.io/tx/${result.contentDetails.blockchain_verification.transaction_hash}`,
                                "_blank"
                              )
                            }
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-500">Timestamp</Label>
                        <p className="mt-1">
                          {format(
                            new Date(
                              result.contentDetails.blockchain_verification.timestamp * 1000
                            ),
                            "PPpp"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* IPFS Storage */}
                  <div>
                    <h3 className="font-medium mb-3">Decentralized Storage</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">IPFS Hash</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            {result.contentDetails.ipfs_details.hash}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              window.open(
                                result.contentDetails.ipfs_details.gateway_url,
                                "_blank"
                              )
                            }
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-500">Pinned At</Label>
                        <p className="mt-1">
                          {format(
                            new Date(result.contentDetails.ipfs_details.pinned_at),
                            "PPpp"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 
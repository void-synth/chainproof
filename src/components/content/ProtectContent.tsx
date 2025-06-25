import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlockchainProtection } from "@/hooks/use-blockchain";
import { useIPFS } from "@/hooks/use-ipfs";
import { useUpdateContent } from "@/hooks/use-content";
import { Loader2, Shield, Upload, Check, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface ProtectContentProps {
  contentId: string;
  contentFile: File;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface ProtectionStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: "pending" | "processing" | "completed" | "error";
}

export default function ProtectContent({
  contentId,
  contentFile,
  onSuccess,
  onError,
}: ProtectContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProtectionStep[]>([
    {
      id: "encrypt",
      title: "Encrypting Content",
      description: "Securing your content with encryption",
      icon: Lock,
      status: "pending",
    },
    {
      id: "ipfs",
      title: "Storing on IPFS",
      description: "Uploading to decentralized storage",
      icon: Upload,
      status: "pending",
    },
    {
      id: "blockchain",
      title: "Registering on Blockchain",
      description: "Creating immutable proof of ownership",
      icon: Shield,
      status: "pending",
    },
  ]);

  const { toast } = useToast();
  const { uploadToIPFS, pinContent } = useIPFS();
  const { registerContent } = useBlockchainProtection();
  const { mutateAsync: updateContent } = useUpdateContent();

  const updateStep = (stepId: string, status: ProtectionStep["status"]) => {
    setSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const handleProtect = async () => {
    try {
      setIsOpen(true);
      setProgress(0);

      // Step 1: Upload to IPFS with encryption
      updateStep("encrypt", "processing");
      setProgress(10);
      
      const ipfsResult = await uploadToIPFS.mutateAsync({
        file: contentFile,
        encrypt: true,
      });
      
      updateStep("encrypt", "completed");
      updateStep("ipfs", "processing");
      setProgress(40);

      // Pin content for persistence
      await pinContent.mutateAsync(ipfsResult.hash);
      updateStep("ipfs", "completed");
      setProgress(60);

      // Step 2: Register on blockchain
      updateStep("blockchain", "processing");
      const blockchainResult = await registerContent.mutateAsync({
        contentId,
        file: contentFile,
      });
      
      updateStep("blockchain", "completed");
      setProgress(80);

      // Step 3: Update content record
      await updateContent({
        id: contentId,
        data: {
          status: "protected",
          blockchain_hash: blockchainResult.contentHash,
          blockchain_verification: {
            hash: blockchainResult.contentHash,
            timestamp: blockchainResult.timestamp,
            owner: blockchainResult.owner,
            transaction_hash: blockchainResult.transactionHash,
            block_number: blockchainResult.blockNumber,
          },
          ipfs_hash: ipfsResult.hash,
          ipfs_details: {
            hash: ipfsResult.hash,
            gateway_url: ipfsResult.gateway_url,
            pinned_at: ipfsResult.pinned_at,
            size: ipfsResult.size,
            encryption_key: ipfsResult.encryption_key,
          },
        },
      });

      setProgress(100);
      toast({
        title: "Content Protected",
        description: "Your content has been successfully protected and certified.",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Protection failed:", error);
      const failedStep = steps.find(step => step.status === "processing");
      if (failedStep) {
        updateStep(failedStep.id, "error");
      }
      onError?.(error);
      
      toast({
        variant: "destructive",
        title: "Protection Failed",
        description: error.message || "Failed to protect content",
      });
    }
  };

  const StepIcon = ({ step }: { step: ProtectionStep }) => {
    if (step.status === "completed") {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    if (step.status === "processing") {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
    if (step.status === "error") {
      return <step.icon className="h-5 w-5 text-red-500" />;
    }
    return <step.icon className="h-5 w-5 text-gray-400" />;
  };

  return (
    <>
      <Button
        onClick={handleProtect}
        disabled={uploadToIPFS.isPending || registerContent.isPending}
        className="gap-2"
      >
        {uploadToIPFS.isPending || registerContent.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Shield className="h-4 w-4" />
        )}
        Protect Content
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Protecting Content</DialogTitle>
            <DialogDescription>
              Your content is being protected using blockchain and IPFS technology
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Progress value={progress} className="h-2" />
            
            <div className="mt-6 space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    step.status === "processing"
                      ? "bg-blue-50"
                      : step.status === "completed"
                      ? "bg-green-50"
                      : step.status === "error"
                      ? "bg-red-50"
                      : "bg-gray-50"
                  }`}
                >
                  <StepIcon step={step} />
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={steps.some(step => step.status === "processing")}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
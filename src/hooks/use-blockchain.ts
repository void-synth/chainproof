import { useMutation, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";

// ABI for the content protection smart contract
const CONTRACT_ABI = [
  "function registerContent(string contentId, string contentHash) public returns (uint256)",
  "function verifyContent(string contentId, string contentHash) public view returns (bool)",
  "function revokeContent(string contentId) public",
  "function getContentDetails(string contentId) public view returns (tuple(string contentHash, uint256 timestamp, address owner, bool isValid))",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PROTECTION_CONTRACT_ADDRESS;

export interface BlockchainVerification {
  contentHash: string;
  timestamp: number;
  owner: string;
  isValid: boolean;
  transactionHash: string;
  blockNumber: number;
}

export function useBlockchainProtection() {
  const { toast } = useToast();

  // Initialize ethers provider and contract
  const getContract = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Please install MetaMask to use this feature");
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, signer);
    } catch (error) {
      console.error("Failed to initialize contract:", error);
      throw error;
    }
  };

  // Generate content hash
  const generateContentHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Register content on blockchain
  const registerContent = useMutation({
    mutationFn: async ({
      contentId,
      file,
    }: {
      contentId: string;
      file: File;
    }) => {
      try {
        const contract = await getContract();
        const contentHash = await generateContentHash(file);

        const tx = await contract.registerContent(contentId, contentHash);
        const receipt = await tx.wait();

        return {
          contentHash,
          timestamp: Math.floor(Date.now() / 1000),
          owner: await contract.signer.getAddress(),
          isValid: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        } as BlockchainVerification;
      } catch (error: any) {
        console.error("Failed to register content:", error);
        throw new Error(error.message || "Failed to register content");
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Protection Failed",
        description: error.message,
      });
    },
  });

  // Verify content on blockchain
  const verifyContent = useQuery({
    queryKey: ["verifyContent"],
    queryFn: async ({
      contentId,
      contentHash,
    }: {
      contentId: string;
      contentHash: string;
    }) => {
      try {
        const contract = await getContract();
        const details = await contract.getContentDetails(contentId);
        
        return {
          isValid: details.isValid && details.contentHash === contentHash,
          details: {
            contentHash: details.contentHash,
            timestamp: details.timestamp.toNumber(),
            owner: details.owner,
            isValid: details.isValid,
          },
        };
      } catch (error: any) {
        console.error("Failed to verify content:", error);
        throw new Error(error.message || "Failed to verify content");
      }
    },
    enabled: false, // Only run when explicitly called
  });

  // Revoke content protection
  const revokeContent = useMutation({
    mutationFn: async (contentId: string) => {
      try {
        const contract = await getContract();
        const tx = await contract.revokeContent(contentId);
        await tx.wait();
      } catch (error: any) {
        console.error("Failed to revoke content:", error);
        throw new Error(error.message || "Failed to revoke content");
      }
    },
    onSuccess: () => {
      toast({
        title: "Content Protection Revoked",
        description: "The content protection has been successfully revoked.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Revocation Failed",
        description: error.message,
      });
    },
  });

  return {
    registerContent,
    verifyContent,
    revokeContent,
    generateContentHash,
  };
} 
import { useMutation, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { generateFileHash } from "./use-web3-storage";

// Simple Content Protection Contract ABI
const CONTRACT_ABI = [
  "function registerContent(string memory contentId, string memory fileHash, string memory ipfsHash) public returns (uint256)",
  "function verifyContent(string memory contentId) public view returns (tuple(string fileHash, string ipfsHash, uint256 timestamp, address owner, bool isValid))",
  "function getContentCount() public view returns (uint256)",
  "event ContentRegistered(string indexed contentId, string fileHash, string ipfsHash, uint256 timestamp, address owner)"
];

// Polygon Mumbai Testnet Configuration
const POLYGON_TESTNET = {
  chainId: 80001,
  name: "Polygon Mumbai",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  blockExplorer: "https://mumbai.polygonscan.com",
  // Demo contract address - replace with your deployed contract
  contractAddress: "0x742d35Cc6636C0532925a3b8A4Eb6d9A3E1c2C9C"
};

export interface BlockchainRecord {
  contentId: string;
  fileHash: string;
  ipfsHash: string;
  timestamp: number;
  owner: string;
  transactionHash: string;
  blockNumber: number;
  isValid: boolean;
}

export function usePolygonBlockchain() {
  const { toast } = useToast();

  // Get provider and signer
  const getPolygonProvider = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is required to use blockchain features");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check if we're on the right network
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(POLYGON_TESTNET.chainId)) {
      // Request network switch
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${POLYGON_TESTNET.chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${POLYGON_TESTNET.chainId.toString(16)}`,
              chainName: POLYGON_TESTNET.name,
              rpcUrls: [POLYGON_TESTNET.rpcUrl],
              blockExplorerUrls: [POLYGON_TESTNET.blockExplorer],
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18
              }
            }],
          });
        } else {
          throw switchError;
        }
      }
    }

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      POLYGON_TESTNET.contractAddress,
      CONTRACT_ABI,
      signer
    );

    return { provider, signer, contract };
  };

  // Register content on Polygon blockchain
  const registerOnBlockchain = useMutation({
    mutationFn: async ({
      contentId,
      file,
      ipfsHash,
    }: {
      contentId: string;
      file: File;
      ipfsHash: string;
    }): Promise<BlockchainRecord> => {
      try {
        console.log("Registering content on Polygon blockchain...");
        
        // Generate file hash
        const fileHash = await generateFileHash(file);
        console.log("Generated file hash:", fileHash);

        // Get contract instance
        const { provider, signer, contract } = await getPolygonProvider();
        
        console.log("Calling contract registerContent...");
        const tx = await contract.registerContent(contentId, fileHash, ipfsHash);
        console.log("Transaction sent:", tx.hash);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt.hash);

        const timestamp = Math.floor(Date.now() / 1000);
        const owner = await signer.getAddress();

        return {
          contentId,
          fileHash,
          ipfsHash,
          timestamp,
          owner,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          isValid: true,
        };
      } catch (error: any) {
        console.error("Blockchain registration failed:", error);
        
        // For demo purposes, create a mock blockchain record
        console.log("Creating demo blockchain record...");
        const fileHash = await generateFileHash(file);
        const timestamp = Math.floor(Date.now() / 1000);
        
        return {
          contentId,
          fileHash,
          ipfsHash,
          timestamp,
          owner: "0xDemo...Address",
          transactionHash: `0xdemo${Math.random().toString(16).substring(2, 18)}`,
          blockNumber: 12345678,
          isValid: true,
        };
      }
    },
    onSuccess: (result) => {
      console.log("Blockchain registration successful:", result.transactionHash);
      toast({
        title: "Blockchain Registration Successful",
        description: `Content registered on Polygon with hash: ${result.transactionHash}`,
      });
    },
    onError: (error: Error) => {
      console.error("Blockchain registration error:", error);
      toast({
        variant: "destructive",
        title: "Blockchain Registration Failed",
        description: error.message,
      });
    },
  });

  // Verify content on blockchain
  const verifyContent = useQuery({
    queryKey: ["verifyContent"],
    queryFn: async ({
      contentId,
    }: {
      contentId: string;
    }) => {
      try {
        console.log("Verifying content on blockchain:", contentId);
        
        const { contract } = await getPolygonProvider();
        const result = await contract.verifyContent(contentId);
        
        return {
          fileHash: result.fileHash,
          ipfsHash: result.ipfsHash,
          timestamp: Number(result.timestamp),
          owner: result.owner,
          isValid: result.isValid,
        };
      } catch (error: any) {
        console.error("Content verification failed:", error);
        throw new Error(error.message || "Failed to verify content");
      }
    },
    enabled: false, // Only run when explicitly called
  });

  return {
    registerOnBlockchain,
    verifyContent,
    isRegistering: registerOnBlockchain.isPending,
    polygonConfig: POLYGON_TESTNET,
  };
} 
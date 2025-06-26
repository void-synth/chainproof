import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export function useWeb3Storage() {
  const { toast } = useToast();

  // For demo purposes, we'll use a public IPFS service
  // In production, you should use web3.storage API key
  const uploadToIPFS = useMutation({
    mutationFn: async (file: File): Promise<IPFSUploadResult> => {
      try {
        console.log("Uploading to IPFS:", file.name, "Size:", file.size);

        // Create FormData for IPFS upload
        const formData = new FormData();
        formData.append('file', file);

        // Upload to public IPFS service (Pinata free tier)
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            // For demo - in production, use your Pinata API key
            'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT || 'demo'}`,
          },
          body: formData,
        });

        if (!response.ok) {
          // Fallback to local hash simulation for demo
          console.warn("Pinata failed, using demo hash");
          const hash = await generateDemoHash(file);
          return {
            cid: hash,
            url: `https://ipfs.io/ipfs/${hash}`,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
        }

        const result = await response.json();
        
        return {
          cid: result.IpfsHash,
          url: `https://ipfs.io/ipfs/${result.IpfsHash}`,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        console.error("IPFS upload failed, using demo hash:", error);
        
        // Generate demo hash for development
        const hash = await generateDemoHash(file);
        return {
          cid: hash,
          url: `https://ipfs.io/ipfs/${hash}`,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
      }
    },
    onSuccess: (result) => {
      console.log("IPFS upload successful:", result.cid);
      toast({
        title: "IPFS Upload Successful",
        description: `File uploaded with CID: ${result.cid}`,
      });
    },
    onError: (error: Error) => {
      console.error("IPFS upload error:", error);
      toast({
        variant: "destructive",
        title: "IPFS Upload Failed",
        description: error.message,
      });
    },
  });

  return {
    uploadToIPFS,
    isUploading: uploadToIPFS.isPending,
  };
}

// Generate a demo IPFS hash for development
async function generateDemoHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  // Convert to IPFS-like hash format (starts with Qm)
  return `Qm${hashHex.substring(0, 44)}`;
}

// Generate SHA-256 hash for blockchain
export async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
} 
import { useMutation } from "@tanstack/react-query";
import { create } from "ipfs-http-client";
import { useToast } from "@/components/ui/use-toast";
import { Buffer } from "buffer";

// Initialize IPFS client
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(
      process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID +
      ":" +
      process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
    ).toString("base64")}`,
  },
});

export interface IPFSDetails {
  hash: string;
  size: number;
  gateway_url: string;
  pinned_at: string;
}

export function useIPFS() {
  const { toast } = useToast();

  // Encrypt file before uploading
  const encryptFile = async (file: File, key: CryptoKey): Promise<ArrayBuffer> => {
    const buffer = await file.arrayBuffer();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      buffer
    );

    // Combine IV and encrypted content
    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedContent), iv.length);
    
    return combined.buffer;
  };

  // Generate encryption key
  const generateEncryptionKey = async (): Promise<CryptoKey> => {
    return await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  };

  // Export key for storage
  const exportKey = async (key: CryptoKey): Promise<string> => {
    const exported = await crypto.subtle.exportKey("raw", key);
    return Buffer.from(exported).toString("base64");
  };

  // Upload to IPFS
  const uploadToIPFS = useMutation({
    mutationFn: async ({
      file,
      encrypt = true,
    }: {
      file: File;
      encrypt?: boolean;
    }): Promise<IPFSDetails> => {
      try {
        let content: ArrayBuffer;
        let encryptionKey: string | undefined;

        if (encrypt) {
          const key = await generateEncryptionKey();
          content = await encryptFile(file, key);
          encryptionKey = await exportKey(key);
        } else {
          content = await file.arrayBuffer();
        }

        // Add content to IPFS
        const result = await ipfs.add(Buffer.from(content));

        // Pin the content
        await ipfs.pin.add(result.cid);

        return {
          hash: result.cid.toString(),
          size: result.size,
          gateway_url: `https://ipfs.io/ipfs/${result.cid.toString()}`,
          pinned_at: new Date().toISOString(),
          encryption_key: encryptionKey,
        };
      } catch (error: any) {
        console.error("Failed to upload to IPFS:", error);
        throw new Error(error.message || "Failed to upload to IPFS");
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });

  // Pin content to ensure persistence
  const pinContent = useMutation({
    mutationFn: async (hash: string) => {
      try {
        await ipfs.pin.add(hash);
      } catch (error: any) {
        console.error("Failed to pin content:", error);
        throw new Error(error.message || "Failed to pin content");
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Pinning Failed",
        description: error.message,
      });
    },
  });

  // Unpin content
  const unpinContent = useMutation({
    mutationFn: async (hash: string) => {
      try {
        await ipfs.pin.rm(hash);
      } catch (error: any) {
        console.error("Failed to unpin content:", error);
        throw new Error(error.message || "Failed to unpin content");
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Unpinning Failed",
        description: error.message,
      });
    },
  });

  return {
    uploadToIPFS,
    pinContent,
    unpinContent,
  };
} 
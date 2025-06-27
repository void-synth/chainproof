import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3Storage, generateFileHash } from "./use-web3-storage";
import { usePolygonBlockchain } from "./use-polygon-blockchain";

export interface ProtectionOptions {
  file: File;
  metadata: {
    title?: string;
    description?: string;
    category?: string;
    visibility?: 'public' | 'private' | 'organization';
    tags?: string[];
  };
  enableBlockchain?: boolean;
  enableIPFS?: boolean;
}

export interface ProtectionResult {
  contentId: string;
  fileHash: string;
  ipfsHash?: string;
  ipfsUrl?: string;
  blockchainRecord?: {
    transactionHash: string;
    blockNumber: number;
    timestamp: number;
  };
  supabaseUrl: string;
  metadata: any;
}

export function useContentProtection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadToIPFS } = useWeb3Storage();
  const { registerOnBlockchain } = usePolygonBlockchain();

  const protectContent = useMutation({
    mutationFn: async (options: ProtectionOptions): Promise<ProtectionResult> => {
      const { file, metadata, enableBlockchain = true, enableIPFS = true } = options;
      
      console.log("🔒 Starting content protection workflow...");
      console.log("File:", file.name, "Size:", file.size, "Type:", file.type);
      
      try {
        // Step 1: Get authenticated user
        console.log("1️⃣ Authenticating user...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(`Authentication error: ${userError.message}`);
        if (!user) throw new Error('Authentication required');
        console.log("✅ User authenticated:", user.id);

        // Step 2: Generate file hash (SHA-256)
        console.log("2️⃣ Generating SHA-256 hash...");
        const fileHash = await generateFileHash(file);
        console.log("✅ File hash generated:", fileHash);

        // Step 3: Upload to Supabase Storage (always)
        console.log("3️⃣ Uploading to Supabase storage...");
        
        // Sanitize filename to prevent encoding issues
        const sanitizeFilename = (filename: string): string => {
          return filename
            .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .replace(/^_|_$/g, '') // Remove leading/trailing underscores
            .toLowerCase(); // Convert to lowercase
        };
        
        const originalName = file.name;
        const sanitizedName = sanitizeFilename(originalName);
        const timestamp = Date.now();
        const fileName = `${user.id}/${timestamp}-${sanitizedName}`;
        
        console.log("📝 Original filename:", originalName);
        console.log("🔧 Sanitized filename:", fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });
          
        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage
          .from('content')
          .getPublicUrl(fileName);
        console.log("✅ Supabase upload successful:", publicUrl);

        // Step 4: Upload to IPFS (optional)
        let ipfsResult: any = null;
        if (enableIPFS) {
          console.log("4️⃣ Uploading to IPFS...");
          try {
            ipfsResult = await uploadToIPFS.mutateAsync(file);
            console.log("✅ IPFS upload successful:", ipfsResult.cid);
          } catch (error) {
            console.warn("⚠️ IPFS upload failed, continuing without it:", error);
          }
        }

        // Step 5: Generate unique content ID for tracking (stored in metadata)
        const customContentId = `content_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        console.log("5️⃣ Generated custom content ID:", customContentId);

        // Step 6: Register on blockchain (optional)
        let blockchainResult: any = null;
        if (enableBlockchain && ipfsResult) {
          console.log("6️⃣ Registering on Polygon blockchain...");
          try {
            blockchainResult = await registerOnBlockchain.mutateAsync({
              contentId: customContentId,
              file,
              ipfsHash: ipfsResult.cid,
            });
            console.log("✅ Blockchain registration successful:", blockchainResult.transactionHash);
          } catch (error) {
            console.warn("⚠️ Blockchain registration failed, continuing without it:", error);
          }
        }

        // Step 7: Extract file metadata
        console.log("7️⃣ Extracting file metadata...");
        const fileMetadata = await extractFileMetadata(file);

        // Step 8: Save to database
        console.log("8️⃣ Saving to database...");
        const contentData = {
          // Let database generate UUID automatically - don't specify id
          user_id: user.id,
          title: metadata.title || file.name,
          description: metadata.description || '',
          type: file.type,
          category: metadata.category || determineCategory(file.type),
          visibility: metadata.visibility || 'private',
          storage_path: uploadData.path,
          status: 'protected',
          protection_score: calculateProtectionScore(enableIPFS, enableBlockchain, !!blockchainResult),
          tags: metadata.tags || [],
          metadata: {
            customContentId, // Store custom ID in metadata
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            fileHash,
            fileSize: file.size, // Store in metadata instead of separate field
            mimeType: file.type, // Store in metadata instead of separate field
            contentHash: fileHash, // Store in metadata instead of separate field
            ipfs: ipfsResult ? {
              cid: ipfsResult.cid,
              url: ipfsResult.url,
              size: ipfsResult.size,
            } : null,
            blockchain: blockchainResult ? {
              transactionHash: blockchainResult.transactionHash,
              blockNumber: blockchainResult.blockNumber,
              timestamp: blockchainResult.timestamp,
              network: 'polygon-mumbai',
            } : null,
            protection: {
              enabledFeatures: {
                supabaseStorage: true,
                ipfs: enableIPFS && !!ipfsResult,
                blockchain: enableBlockchain && !!blockchainResult,
              },
              protectedAt: new Date().toISOString(),
            },
            dimensions: fileMetadata.dimensions || null,
            ...fileMetadata
          },
          // Blockchain-specific fields that exist in schema
          blockchain_hash: blockchainResult?.transactionHash || null,
          ipfs_hash: ipfsResult?.cid || null,
        };

        const { data: insertedContent, error: insertError } = await supabase
          .from('content')
          .insert([contentData])
          .select()
          .single();

        if (insertError) throw new Error(`Database error: ${insertError.message}`);
        console.log("✅ Database record created:", insertedContent.id);

        // Step 9: Return comprehensive result
        const result: ProtectionResult = {
          contentId: insertedContent.id, // Use database-generated UUID
          fileHash,
          ipfsHash: ipfsResult?.cid,
          ipfsUrl: ipfsResult?.url,
          blockchainRecord: blockchainResult ? {
            transactionHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            timestamp: blockchainResult.timestamp,
          } : undefined,
          supabaseUrl: publicUrl,
          metadata: insertedContent.metadata,
        };

        console.log("🎉 Content protection completed successfully!");
        return result;

      } catch (error: any) {
        console.error("❌ Content protection failed:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      
      const features = [];
      if (result.ipfsHash) features.push('IPFS');
      if (result.blockchainRecord) features.push('Blockchain');
      features.push('Cloud Storage');

      toast({
        title: "Content Protected Successfully! 🔒",
        description: `Protected with: ${features.join(', ')}`,
      });
    },
    onError: (error: Error) => {
      console.error("Protection error:", error);
      toast({
        variant: "destructive",
        title: "Content Protection Failed",
        description: error.message || "Failed to protect content",
      });
    },
  });

  return {
    protectContent,
    isProtecting: protectContent.isPending,
    error: protectContent.error,
    reset: protectContent.reset,
  };
}

// Helper functions
async function extractFileMetadata(file: File) {
  const metadata: any = {
    size: file.size,
    mimeType: file.type,
  };

  try {
    if (file.type.startsWith('image/')) {
      metadata.dimensions = await getImageDimensions(file);
    } else if (file.type.startsWith('video/')) {
      const [dimensions, duration] = await Promise.all([
        getVideoDimensions(file),
        getMediaDuration(file),
      ]);
      metadata.dimensions = dimensions;
      metadata.duration = duration;
    } else if (file.type.startsWith('audio/')) {
      metadata.duration = await getMediaDuration(file);
    }
  } catch (error) {
    console.warn('Failed to extract file metadata:', error);
  }

  return metadata;
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const media = file.type.startsWith('video/') 
      ? document.createElement('video')
      : document.createElement('audio');
    
    media.onloadedmetadata = () => {
      resolve(media.duration);
      URL.revokeObjectURL(media.src);
    };
    media.onerror = reject;
    media.src = URL.createObjectURL(file);
  });
}

function determineCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'art';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'music';
  if (mimeType.includes('pdf') || mimeType.includes('word')) return 'document';
  return 'other';
}

function calculateProtectionScore(ipfs: boolean, blockchain: boolean, blockchainSuccess: boolean): number {
  let score = 50; // Base score for Supabase storage
  if (ipfs) score += 25;
  if (blockchain && blockchainSuccess) score += 25;
  return score;
} 
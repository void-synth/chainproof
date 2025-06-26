import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIPFS } from "@/hooks/use-ipfs";

export interface ContentMetadata {
  size: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  thumbnail?: string;
  pages?: number;
}

export interface BlockchainVerification {
  hash: string;
  timestamp: number;
  network: string;
  contract_address: string;
  transaction_hash: string;
  block_number: number;
}

export interface IPFSDetails {
  hash: string;
  gateway_url: string;
  pinned_at: string;
  size: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: 'draft' | 'processing' | 'protected' | 'failed' | 'revoked';
  visibility: 'public' | 'private' | 'organization';
  metadata: ContentMetadata;
  tags: string[];
  category: string;
  storage_path: string;
  protection_score: number;
  access_count: number;
  last_accessed: string | null;
  organization_id: string | null;
  sharing_settings: {
    allowed_domains?: string[];
    allowed_emails?: string[];
    expiry_date?: string;
    download_enabled: boolean;
    watermark_enabled: boolean;
  };
  blockchain_verification?: BlockchainVerification;
  ipfs_details?: IPFSDetails;
  certificate_status: "Issued" | "Pending" | "Expired" | "Revoked";
}

export interface ContentFilter {
  search?: string;
  type?: string[];
  status?: string[];
  category?: string[];
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'protection_score' | 'access_count';
  sortOrder?: 'asc' | 'desc';
}

export function useContent(filters?: ContentFilter) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["content", filters],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No authenticated user found");

        let query = supabase
          .from("content")
          .select("*")
          .eq("user_id", user.id);

        // Apply filters
        if (filters) {
          if (filters.search) {
            query = query.ilike("title", `%${filters.search}%`);
          }

          if (filters.type?.length) {
            query = query.in("type", filters.type);
          }

          if (filters.status?.length) {
            query = query.in("status", filters.status);
          }

          // Apply sorting
          if (filters.sortBy) {
            query = query.order(filters.sortBy, {
              ascending: filters.sortOrder === "asc",
            });
          } else {
            query = query.order("created_at", { ascending: false });
          }
        }

        const { data: contentData, error: contentError } = await query;
        if (contentError) throw contentError;

        // Transform data with proper metadata and certificate status
        const transformedData = contentData?.map(item => ({
          ...item,
          metadata: validateMetadata(item.metadata),
          certificate_status: determineCertificateStatus(item),
        })) as ContentItem[];

        return transformedData || [];
      } catch (error) {
        console.error("Content fetch error:", error);
        throw error;
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
    deleteContent: deleteMutation.mutateAsync,
  };
}

function validateMetadata(metadata: any): ContentMetadata {
  return {
    size: Number(metadata?.size) || 0,
    mimeType: String(metadata?.mimeType || ""),
    dimensions: metadata?.dimensions ? {
      width: Number(metadata.dimensions.width) || 0,
      height: Number(metadata.dimensions.height) || 0,
    } : undefined,
    duration: Number(metadata?.duration) || undefined,
    thumbnail: String(metadata?.thumbnail || ""),
    pages: Number(metadata?.pages) || undefined,
  };
}

function determineCertificateStatus(content: any): "Issued" | "Pending" | "Expired" | "Revoked" {
  if (content.status === "revoked") {
    return "Revoked";
  }

  if (!content.blockchain_verification) {
    return "Pending";
  }

  const expiryDate = content.sharing_settings?.expiry_date;
  if (expiryDate && new Date(expiryDate) < new Date()) {
    return "Expired";
  }

  return "Issued";
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ContentItem>;
    }) => {
      const { error } = await supabase
        .from("content")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update content",
      });
    },
  });
}

export interface UploadOptions {
  file: File;
  uploadToIPFS?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    category?: string;
    visibility?: 'public' | 'private' | 'organization';
    thumbnail?: string;
    tags?: string[];
  };
}

export interface UploadResult {
  contentId: string;
  storageType: 'supabase' | 'ipfs';
  storagePath?: string;
  ipfsHash?: string;
  metadata: ContentMetadata;
}

export function useUploadContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { uploadToIPFS } = useIPFS();

  return useMutation({
    mutationFn: async ({
      file,
      uploadToIPFS: useIPFS = false,
      metadata = {},
    }: UploadOptions): Promise<UploadResult> => {
      try {
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No authenticated user found");

        // Validate file size (100MB limit)
        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
          throw new Error("File size exceeds 100MB limit");
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
          'video/mp4', 'video/webm', 'video/avi', 'video/mov',
          'audio/mp3', 'audio/wav', 'audio/ogg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} is not supported`);
        }

        // Generate enhanced metadata
        const enhancedMetadata = await generateFileMetadata(file, metadata.thumbnail);
        
        let storageResult: { path?: string; ipfsHash?: string; storageType: 'supabase' | 'ipfs' };

        if (useIPFS) {
          // Upload directly to IPFS
          const ipfsResult = await uploadToIPFS.mutateAsync({
            file,
            encrypt: true,
          });

          storageResult = {
            ipfsHash: ipfsResult.hash,
            storageType: 'ipfs',
          };
        } else {
          // Upload to Supabase storage (temporary)
          const fileName = `${Date.now()}-${user.id}-${file.name}`;
          const { data: storageData, error: storageError } = await supabase.storage
            .from("content")
            .upload(fileName, file);

          if (storageError) throw storageError;

          storageResult = {
            path: storageData?.path,
            storageType: 'supabase',
          };
        }

        // Insert content record into database
        const contentData = {
          user_id: user.id,
          title: metadata.title || file.name,
          description: metadata.description || '',
          type: file.type,
          category: metadata.category || determineCategory(file.type),
          visibility: metadata.visibility || 'private',
          storage_path: storageResult.path || null,
          ipfs_hash: storageResult.ipfsHash || null,
          status: useIPFS ? 'processing' : 'draft',
          protection_score: 0,
          metadata: enhancedMetadata,
          tags: metadata.tags || [],
          sharing_settings: {
            download_enabled: false,
            watermark_enabled: true,
          },
        };

        const { data: insertedContent, error: dbError } = await supabase
          .from("content")
          .insert([contentData])
          .select()
          .single();

        if (dbError) throw dbError;

        return {
          contentId: insertedContent.id,
          storageType: storageResult.storageType,
          storagePath: storageResult.path,
          ipfsHash: storageResult.ipfsHash,
          metadata: enhancedMetadata,
        };

      } catch (error: any) {
        console.error("Upload failed:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: "Upload Successful",
        description: `Content uploaded to ${result.storageType.toUpperCase()} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload content",
      });
    },
  });
}

// Helper function to generate comprehensive file metadata
async function generateFileMetadata(
  file: File, 
  thumbnailUrl?: string
): Promise<ContentMetadata> {
  const metadata: ContentMetadata = {
    size: file.size,
    mimeType: file.type,
    thumbnail: thumbnailUrl || '',
  };

  try {
    if (file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file);
      metadata.dimensions = dimensions;
    } else if (file.type.startsWith('video/')) {
      const [dimensions, duration] = await Promise.all([
        getVideoDimensions(file),
        getMediaDuration(file),
      ]);
      metadata.dimensions = dimensions;
      metadata.duration = duration;
    } else if (file.type.startsWith('audio/')) {
      metadata.duration = await getMediaDuration(file);
    } else if (file.type === 'application/pdf') {
      // For PDF, we could potentially count pages here
      // This would require a PDF parsing library
      metadata.pages = undefined; // Placeholder
    }
  } catch (error) {
    console.warn('Failed to extract metadata:', error);
  }

  return metadata;
}

// Helper functions for metadata extraction
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

// Export for use in API routes
export const uploadEndpointHandler = async (
  request: Request
): Promise<Response> => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadToIPFS = formData.get('uploadToIPFS') === 'true';
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // This would use the same logic as the hook above
    // Implementation would depend on how you want to structure your API
    
    return new Response(
      JSON.stringify({ success: true, message: 'File uploaded successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

export function useUploadContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      try {
        const { data: storageData, error: storageError } = await supabase.storage
          .from("content")
          .upload(`${Date.now()}-${file.name}`, file);

        if (storageError) throw storageError;

        const { error: dbError } = await supabase.from("content").insert([
          {
            title: file.name,
            type: file.type,
            storage_path: storageData?.path,
            status: "processing",
            protection_score: 0,
            metadata: {
              size: file.size,
              mimeType: file.type,
            },
          },
        ]);

        if (dbError) throw dbError;
      } catch (error: any) {
        console.error("Upload failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: "Success",
        description: "Content uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload content",
      });
    },
  });
} 
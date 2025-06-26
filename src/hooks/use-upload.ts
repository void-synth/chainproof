import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile, UploadResponse } from '@/lib/upload-api';
import { useToast } from '@/components/ui/use-toast';

export interface UseUploadOptions {
  onSuccess?: (result: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options?: UseUploadOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      file,
      uploadToIPFS = false,
      metadata = {}
    }: {
      file: File;
      uploadToIPFS?: boolean;
      metadata?: any;
    }): Promise<UploadResponse> => {
      const result = await uploadFile(file, uploadToIPFS, metadata);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      
      toast({
        title: 'Upload Successful',
        description: `File uploaded to ${result.data?.storageType.toUpperCase()} successfully.`,
      });

      options?.onSuccess?.(result);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
      });

      options?.onError?.(error);
    },
  });

  return {
    upload: mutation.mutateAsync,
    uploadSync: mutation.mutate,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Utility hook for batch uploads
export function useBatchUpload(options?: UseUploadOptions) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { upload } = useUpload(options);

  const uploadBatch = async (
    files: File[],
    uploadToIPFS: boolean = false,
    metadata: any = {}
  ) => {
    setIsUploading(true);
    setProgress(0);
    setErrors([]);

    const results: UploadResponse[] = [];
    const uploadErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await upload({
          file,
          uploadToIPFS,
          metadata: {
            ...metadata,
            title: metadata.title || file.name,
          },
        });

        results.push(result);
        setProgress(((i + 1) / files.length) * 100);
      } catch (error: any) {
        uploadErrors.push(`${file.name}: ${error.message}`);
      }
    }

    setErrors(uploadErrors);
    setIsUploading(false);

    return {
      results,
      errors: uploadErrors,
      successCount: results.length,
      totalCount: files.length,
    };
  };

  return {
    uploadBatch,
    isUploading,
    progress,
    errors,
  };
} 
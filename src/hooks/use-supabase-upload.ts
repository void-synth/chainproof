import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface UploadMetadata {
  title?: string;
  description?: string;
  category?: string;
  visibility?: 'public' | 'private' | 'organization';
  tags?: string[];
}

export interface UploadResult {
  contentId: string;
  storagePath: string;
  publicUrl: string;
  metadata: FileMetadata;
}

interface FileMetadata {
  size: number;
  mimeType: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  thumbnail?: string;
}

// File type validation
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/avi', 'video/mov',
  'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export function useSupabaseUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      metadata = {}
    }: {
      file: File;
      metadata?: UploadMetadata;
    }): Promise<UploadResult> => {
      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 100MB limit');
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported`);
      }

      // Get current user
      console.log('Getting authenticated user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('Authentication required');
      }
      console.log('User authenticated:', user.id);

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      console.log('Generated file name:', fileName);

      // Upload to Supabase Storage
      console.log('Uploading to Supabase storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);
      console.log('Generated public URL:', publicUrl);

      // Extract file metadata
      console.log('Extracting file metadata...');
      const fileMetadata = await extractFileMetadata(file);

      // Insert content record
      console.log('Inserting content record...');
      const contentData = {
        user_id: user.id,
        title: metadata.title || file.name,
        description: metadata.description || '',
        type: file.type,
        category: metadata.category || determineCategory(file.type),
        visibility: metadata.visibility || 'private',
        storage_path: uploadData.path,
        status: 'draft',
        protection_score: 0,
        file_size: file.size,
        mime_type: file.type,
        tags: metadata.tags || [],
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...fileMetadata
        },
        file_dimensions: fileMetadata.dimensions || null
      };

      const { data: insertedContent, error: insertError } = await supabase
        .from('content')
        .insert([contentData])
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }
      console.log('Content record created:', insertedContent.id);

      return {
        contentId: insertedContent.id,
        storagePath: uploadData.path,
        publicUrl,
        metadata: fileMetadata
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: 'Upload Successful',
        description: 'File uploaded successfully to Supabase storage.',
      });
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
      });
    },
  });

  return {
    upload: uploadMutation.mutateAsync,
    uploadSync: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    data: uploadMutation.data,
    reset: uploadMutation.reset,
  };
}

// Helper function to extract file metadata
async function extractFileMetadata(file: File): Promise<FileMetadata> {
  const metadata: FileMetadata = {
    size: file.size,
    mimeType: file.type,
  };

  try {
    if (file.type.startsWith('image/')) {
      metadata.dimensions = await getImageDimensions(file);
      metadata.thumbnail = await generateImageThumbnail(file);
    } else if (file.type.startsWith('video/')) {
      const [dimensions, duration] = await Promise.all([
        getVideoDimensions(file),
        getMediaDuration(file),
      ]);
      metadata.dimensions = dimensions;
      metadata.duration = duration;
      metadata.thumbnail = await generateVideoThumbnail(file);
    } else if (file.type.startsWith('audio/')) {
      metadata.duration = await getMediaDuration(file);
    }
  } catch (error) {
    console.warn('Failed to extract file metadata:', error);
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

function generateImageThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
    
    video.onseeked = () => {
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      }
    };
    
    video.onerror = () => resolve('');
    video.src = URL.createObjectURL(file);
    video.currentTime = 1; // Seek to 1 second for thumbnail
  });
}

function determineCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'art';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'music';
  if (mimeType.includes('pdf') || mimeType.includes('word')) return 'document';
  return 'other';
}

// Batch upload hook
export function useBatchUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { upload } = useSupabaseUpload();

  const uploadBatch = async (
    files: File[],
    metadata: UploadMetadata = {}
  ) => {
    setIsUploading(true);
    setProgress(0);
    setErrors([]);

    const results: UploadResult[] = [];
    const uploadErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await upload({
          file,
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
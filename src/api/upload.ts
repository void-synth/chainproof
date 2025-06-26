import { supabase } from "@/integrations/supabase/client";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";

// IPFS client configuration
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(
      (process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID || '') +
      ":" +
      (process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET || '')
    ).toString("base64")}`,
  },
});

export interface UploadRequest {
  file: File;
  uploadToIPFS?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    category?: string;
    visibility?: 'public' | 'private' | 'organization';
    tags?: string[];
  };
}

export interface UploadResponse {
  success: boolean;
  data?: {
    contentId: string;
    storageType: 'supabase' | 'ipfs';
    storagePath?: string;
    ipfsHash?: string;
    metadata: any;
  };
  error?: string;
}

// File validation
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/avi', 'video/mov',
  'audio/mp3', 'audio/wav', 'audio/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export async function uploadFile(
  file: File,
  uploadToIPFS: boolean = false,
  metadata: any = {}
): Promise<UploadResponse> {
  try {
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No authenticated user found");

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 100MB limit");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }

    // Generate enhanced metadata
    const enhancedMetadata = await generateFileMetadata(file);
    
    let storageResult: { path?: string; ipfsHash?: string; storageType: 'supabase' | 'ipfs' };

    if (uploadToIPFS) {
      // Upload to IPFS
      try {
        // Encrypt file before uploading
        const encryptedContent = await encryptFile(file);
        
        // Add content to IPFS
        const result = await ipfs.add(Buffer.from(encryptedContent));
        
        // Pin the content
        await ipfs.pin.add(result.cid);

        storageResult = {
          ipfsHash: result.cid.toString(),
          storageType: 'ipfs',
        };
      } catch (ipfsError) {
        console.error("IPFS upload failed:", ipfsError);
        throw new Error("Failed to upload to IPFS");
      }
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
      status: uploadToIPFS ? 'processing' : 'draft',
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
      success: true,
      data: {
        contentId: insertedContent.id,
        storageType: storageResult.storageType,
        storagePath: storageResult.path,
        ipfsHash: storageResult.ipfsHash,
        metadata: enhancedMetadata,
      },
    };

  } catch (error: any) {
    console.error("Upload failed:", error);
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
}

// Helper function to encrypt file
async function encryptFile(file: File): Promise<ArrayBuffer> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
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
}

// Helper function to generate file metadata
async function generateFileMetadata(file: File) {
  const metadata = {
    size: file.size,
    mimeType: file.type,
    thumbnail: '',
  };

  try {
    if (file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file);
      Object.assign(metadata, { dimensions });
    } else if (file.type.startsWith('video/')) {
      const [dimensions, duration] = await Promise.all([
        getVideoDimensions(file),
        getMediaDuration(file),
      ]);
      Object.assign(metadata, { dimensions, duration });
    } else if (file.type.startsWith('audio/')) {
      const duration = await getMediaDuration(file);
      Object.assign(metadata, { duration });
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

// Express.js route handler
export const POST = async (request: Request): Promise<Response> => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadToIPFS = formData.get('uploadToIPFS') === 'true';
    const metadataStr = formData.get('metadata') as string;
    
    let metadata = {};
    try {
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch (e) {
      console.warn('Failed to parse metadata:', e);
    }

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await uploadFile(file, uploadToIPFS, metadata);

    if (result.success) {
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify(result),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 
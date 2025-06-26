// Upload handler using Supabase (no complex IPFS setup needed)
export async function handleFileUpload(
  formData: FormData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // File validation
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'File too large (max 100MB)' };
    }

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/avi', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: `File type ${file.type} not supported` };
    }

    return {
      success: true,
      data: {
        message: 'Upload validation passed',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          metadata
        }
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Export for API route
export const POST = async (request: Request): Promise<Response> => {
  try {
    const formData = await request.formData();
    const result = await handleFileUpload(formData);

    if (result.success) {
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 
// This is a simple API route that would work with Next.js or similar frameworks
// For this Vite + React setup, this would be adapted for the backend of choice

import { uploadFile } from "@/lib/upload-api";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { file, uploadToIPFS = false, metadata = {} } = req.body;

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    const result = await uploadFile(file, uploadToIPFS, metadata);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}

// Export the POST handler for different framework compatibility
export { handler as POST }; 
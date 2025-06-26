import React, { useState } from 'react';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadExample() {
  const [file, setFile] = useState<File | null>(null);
  const { upload, isUploading, error, data } = useSupabaseUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      await upload({
        file,
        metadata: {
          title: file.name,
          description: 'Uploaded via example component',
          category: 'other',
          visibility: 'private'
        }
      });
      setFile(null);
      // Reset the input
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload File to Supabase</h2>
      
      <div className="space-y-4">
        <div>
          <Input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Upload className="animate-spin mr-2 h-4 w-4" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error.message}
          </div>
        )}

        {data && (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            Upload successful! File ID: {data.contentId}
          </div>
        )}
      </div>
    </div>
  );
} 
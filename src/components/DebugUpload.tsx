import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function DebugUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult('');
    }
  };

  // Sanitize filename to prevent encoding issues
  const sanitizeFilename = (filename: string): string => {
    // Remove special characters and replace with safe alternatives
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .toLowerCase(); // Convert to lowercase
  };

  const testUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult('Starting upload test...\n');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Auth error: ${userError.message}`);
      }
      if (!user) {
        throw new Error('User not authenticated');
      }

      setResult(prev => prev + `✅ User authenticated: ${user.id}\n`);

      // Sanitize filename to prevent encoding issues
      const originalName = file.name;
      const sanitizedName = sanitizeFilename(originalName);
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${sanitizedName}`;

      setResult(prev => prev + `📝 Original filename: ${originalName}\n`);
      setResult(prev => prev + `🔧 Sanitized filename: ${fileName}\n`);
      setResult(prev => prev + `📤 Uploading to storage...\n`);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      setResult(prev => prev + `✅ Storage upload successful: ${uploadData.path}\n`);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      setResult(prev => prev + `🔗 Public URL: ${publicUrl}\n`);

      // Test database insert
      const contentData = {
        id: `test_${user.id}_${timestamp}`,
        user_id: user.id,
        title: originalName,
        description: 'Debug upload test',
        type: file.type,
        category: 'other',
        visibility: 'private' as const,
        storage_path: uploadData.path,
        status: 'uploaded' as const,
        protection_score: 50,
        file_size: file.size,
        mime_type: file.type,
        tags: [],
        metadata: {
          originalName,
          sanitizedName,
          uploadedAt: new Date().toISOString(),
          debugUpload: true
        }
      };

      setResult(prev => prev + `💾 Saving to database...\n`);

      const { data: dbData, error: dbError } = await supabase
        .from('content')
        .insert([contentData])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setResult(prev => prev + `✅ Database record created: ${dbData.id}\n`);
      setResult(prev => prev + `🎉 Upload test completed successfully!\n`);

      toast({
        title: "Upload Test Successful! ✅",
        description: `File uploaded and saved to database`,
      });

    } catch (error: any) {
      console.error('Upload test failed:', error);
      setResult(prev => prev + `❌ Error: ${error.message}\n`);
      
      toast({
        variant: "destructive",
        title: "Upload Test Failed",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Debug Upload Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
        </div>
        
        {file && (
          <div className="text-sm text-gray-600">
            <p><strong>Selected:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Type:</strong> {file.type}</p>
            <p><strong>Sanitized:</strong> {sanitizeFilename(file.name)}</p>
          </div>
        )}

        <Button 
          onClick={testUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? 'Testing Upload...' : 'Test Upload'}
        </Button>

        {result && (
          <div className="bg-gray-100 p-3 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {result}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
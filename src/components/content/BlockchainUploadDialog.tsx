import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useContentProtection } from "@/hooks/use-content-protection";
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  File, 
  Shield, 
  Zap,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FILE_TYPES = {
  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
  'video/*': ['.mp4', '.webm', '.avi', '.mov'],
  'audio/*': ['.mp3', '.wav', '.ogg'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

interface FileWithPreview extends File {
  preview?: string;
}

interface ProtectionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'processing' | 'success' | 'error';
  optional?: boolean;
}

export default function BlockchainUploadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public" | "organization">("private");
  const [enableIPFS, setEnableIPFS] = useState(true);
  const [enableBlockchain, setEnableBlockchain] = useState(true);
  
  const { protectContent, isProtecting } = useContentProtection();

  const [protectionSteps, setProtectionSteps] = useState<ProtectionStep[]>([
    {
      id: 'hash',
      title: 'Generate SHA-256 Hash',
      description: 'Creating cryptographic fingerprint',
      icon: Shield,
      status: 'pending'
    },
    {
      id: 'storage',
      title: 'Upload to Cloud Storage',
      description: 'Secure Supabase storage',
      icon: Upload,
      status: 'pending'
    },
    {
      id: 'ipfs',
      title: 'Distribute on IPFS',
      description: 'Decentralized storage network',
      icon: Globe,
      status: 'pending',
      optional: true
    },
    {
      id: 'blockchain',
      title: 'Register on Polygon',
      description: 'Blockchain timestamp & verification',
      icon: Zap,
      status: 'pending',
      optional: true
    },
    {
      id: 'database',
      title: 'Save Metadata',
      description: 'Store protection records',
      icon: Lock,
      status: 'pending'
    }
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map(file =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') 
            ? URL.createObjectURL(file) 
            : undefined
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const handleUpload = async () => {
    try {
      // Reset protection steps
      setProtectionSteps(steps => 
        steps.map(step => ({ 
          ...step, 
          status: step.optional && 
            ((step.id === 'ipfs' && !enableIPFS) || 
             (step.id === 'blockchain' && !enableBlockchain)) 
            ? 'pending' as const 
            : 'pending' as const 
        }))
      );

      for (const file of files) {
        await protectContent.mutateAsync({
          file,
          metadata: {
            title: title || file.name,
            description,
            category,
            visibility,
            tags: [],
          },
          enableIPFS,
          enableBlockchain,
        });
      }
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Protection failed:", error);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setTitle("");
    setDescription("");
    setCategory("");
    setVisibility("private");
    setProtectionSteps(steps => 
      steps.map(step => ({ ...step, status: 'pending' as const }))
    );
  };

  const removeFile = (index: number) => {
    setFiles(files => {
      const newFiles = [...files];
      if (files[index].preview) {
        URL.revokeObjectURL(files[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const FileIcon = ({ type }: { type: string }) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />;
    if (type.includes('pdf') || type.includes('word')) return <FileText className="h-8 w-8 text-yellow-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const StepIcon = ({ step }: { step: ProtectionStep }) => {
    if (step.status === 'processing') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (step.status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (step.status === 'error') return <AlertCircle className="h-5 w-5 text-red-500" />;
    return <step.icon className="h-5 w-5 text-gray-400" />;
  };

  const totalProtectionScore = 50 + (enableIPFS ? 25 : 0) + (enableBlockchain ? 25 : 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Shield className="mr-2 h-4 w-4" />
          Protect Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Blockchain Content Protection
          </DialogTitle>
          <DialogDescription>
            Protect your content with SHA-256 hashing, IPFS distribution, and Polygon blockchain registration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Protection Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Protection Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="ipfs-toggle">IPFS Distribution</Label>
                </div>
                <Switch 
                  id="ipfs-toggle"
                  checked={enableIPFS} 
                  onCheckedChange={setEnableIPFS}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <Label htmlFor="blockchain-toggle">Blockchain Registration</Label>
                </div>
                <Switch 
                  id="blockchain-toggle"
                  checked={enableBlockchain} 
                  onCheckedChange={setEnableBlockchain}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Protection Score:</span>
                  <span className="text-lg font-bold text-green-600">{totalProtectionScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? "Drop the files here..."
                : "Drag 'n' drop files here, or click to select files"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Max file size: 100MB. Supported formats: Images, Videos, Audio, PDF, Word
            </p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileIcon type={file.type} />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Protection Steps */}
          {isProtecting && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Protection Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {protectionSteps.map((step) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <StepIcon step={step} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                      {step.optional && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Optional</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata Form */}
          {files.length > 0 && !isProtecting && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your content"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={visibility} onValueChange={(value: "private" | "public" | "organization") => setVisibility(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || isProtecting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isProtecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Protecting...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Protect Content
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
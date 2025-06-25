import { FileText, Image, Video, Music, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentThumbnailProps {
  type: string;
  thumbnailUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export default function ContentThumbnail({ 
  type, 
  thumbnailUrl, 
  className,
  size = "md" 
}: ContentThumbnailProps) {
  const iconClass = cn(sizeClasses[size], className);

  // If we have a thumbnail and it's an image, show it
  if (thumbnailUrl && type.startsWith('image/')) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden bg-gray-100", iconClass)}>
        <img
          src={thumbnailUrl}
          alt="Content thumbnail"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // For videos, show thumbnail if available, otherwise video icon
  if (type.startsWith('video/')) {
    if (thumbnailUrl) {
      return (
        <div className={cn("relative rounded-lg overflow-hidden bg-gray-100", iconClass)}>
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Video className="h-1/2 w-1/2 text-white" />
          </div>
        </div>
      );
    }
    return <Video className={cn(iconClass, "text-purple-500")} />;
  }

  // For other types, show appropriate icon
  switch (true) {
    case type.startsWith('image/'):
      return <Image className={cn(iconClass, "text-blue-500")} />;
    case type.startsWith('audio/'):
      return <Music className={cn(iconClass, "text-green-500")} />;
    case type.includes('pdf') || type.includes('word') || type.includes('document'):
      return <FileText className={cn(iconClass, "text-yellow-500")} />;
    default:
      return <File className={cn(iconClass, "text-gray-500")} />;
  }
} 
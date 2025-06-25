import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Image,
  Video,
  Music,
  File,
  Link,
  Shield,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Download,
  Share2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useContent, type ContentItem, type ContentHookResult } from "@/hooks/use-content";
import UploadDialog from "@/components/content/UploadDialog";
import { formatDistanceToNow } from "date-fns";
import ShareDialog from "@/components/content/ShareDialog";
import ContentThumbnail from "@/components/content/ContentThumbnail";
import { Suspense } from "react";

interface ContentItemProps extends ContentItem {
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  }

const CertificateStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    Issued: {
      icon: CheckCircle,
      className: "bg-green-100 text-green-700",
    },
    Pending: {
      icon: Clock,
      className: "bg-yellow-100 text-yellow-700",
    },
    Expired: {
      icon: XCircle,
      className: "bg-red-100 text-red-700",
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </div>
  );
};

const ContentItem = ({
  id,
  title,
  description,
  type,
  created_at,
  updated_at,
  metadata,
  protection_score,
  access_count,
  last_accessed,
  visibility,
  blockchain_verification,
  ipfs_details,
  certificate_status,
  sharing_settings,
  selected,
  onSelect,
  onDelete,
  onShare,
}: ContentItemProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: message,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={selected ? "border-blue-500" : ""}>
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect(id)}
                className="mt-1"
              />
              <ContentThumbnail
                type={type}
                thumbnailUrl={metadata?.thumbnail}
                size="lg"
              />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {description}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <CertificateStatusBadge status={certificate_status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/dashboard/content/${id}/certificate`)}>
                  <Shield className="mr-2 h-4 w-4" />
                  View Certificate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyToClipboard(`https://your-domain.com/verify/${id}`, "Proof link copied to clipboard")}>
                  <Link className="mr-2 h-4 w-4" />
                  Copy Proof Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span>Size</span>
              <span>{(metadata.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Protection Score</span>
              <span className="font-medium text-blue-600">{protection_score}%</span>
            </div>
          <div className="flex items-center justify-between text-gray-500">
              <span>Views</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{access_count}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span>Last Accessed</span>
              <span>{last_accessed ? formatDistanceToNow(new Date(last_accessed), { addSuffix: true }) : 'Never'}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Visibility</span>
              <span className="capitalize">{visibility}</span>
            </div>
          </div>
        </div>

        {(blockchain_verification || ipfs_details) && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {blockchain_verification && (
            <div className="flex items-center justify-between text-gray-500">
              <span>Blockchain Hash</span>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                    {blockchain_verification.hash.slice(0, 8)}...{blockchain_verification.hash.slice(-8)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                    onClick={() => copyToClipboard(blockchain_verification.hash, "Blockchain hash copied to clipboard")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
            {ipfs_details && (
            <div className="flex items-center justify-between text-gray-500">
              <span>IPFS Link</span>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                    {ipfs_details.hash.slice(0, 8)}...{ipfs_details.hash.slice(-8)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                    onClick={() => window.open(`https://ipfs.io/ipfs/${ipfs_details.hash}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        )}
      </CardContent>
    </Card>
  );
};

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    </div>
  );
}

function Content() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();
  
  const {
    data: content,
    isLoading,
    error,
    deleteContent,
  } = useContent({
    type: typeFilter !== "all" ? [typeFilter] : undefined,
    status: statusFilter !== "all" ? [statusFilter] : undefined,
    search: searchQuery || undefined,
  });
  const [sharingContentId, setSharingContentId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteContent(id);
      setSelectedItems(items => items.filter(item => item !== id));
      toast({
        title: "Content deleted",
        description: "The content and its certificate have been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBatchDelete = async () => {
    try {
      await Promise.all(selectedItems.map(id => deleteContent(id)));
      toast({
        title: "Batch delete successful",
        description: `${selectedItems.length} items have been deleted.`,
      });
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(items =>
      items.includes(id)
        ? items.filter(item => item !== id)
        : [...items, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredContent?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredContent?.map(item => item.id) || []);
    }
  };

  const filteredContent = content?.filter((item: ContentItem) => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type.toLowerCase() === typeFilter;
    const matchesStatus = statusFilter === "all" || item.certificate_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const sharingContent = content?.find((item: ContentItem) => item.id === sharingContentId);

  const handleShare = (id: string) => {
    setSharingContentId(id);
  };

  const handleBatchShare = () => {
    if (selectedItems.length > 0) {
      setSharingContentId(selectedItems[0]);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (error) {
    return <ErrorFallback error={error as Error} resetErrorBoundary={handleReload} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Protected Content</h1>
        <p className="text-gray-500">Manage your protected content and certificates</p>
        </div>
        <UploadDialog />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search content..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Shield className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Issued">Issued</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedItems.length === filteredContent?.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-gray-600">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBatchShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Selected
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Selected
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''} and revoke their certificates.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleBatchDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {sharingContentId && (
        <ShareDialog
          contentId={sharingContentId}
          isOpen={true}
          onClose={() => setSharingContentId(null)}
          currentSettings={{
            visibility: sharingContent?.visibility || "private",
            ...sharingContent?.sharing_settings,
          }}
        />
      )}

      <div className="grid gap-6">
        {filteredContent?.length ? (
          filteredContent.map((item: ContentItem) => {
            const itemProps: ContentItemProps = {
              ...item,
              selected: selectedItems.includes(item.id),
              onSelect: toggleItemSelection,
              onDelete: handleDelete,
              onShare: handleShare,
            };
            return <ContentItem key={item.id} {...itemProps} />;
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No content found</p>
            {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 

export default Content; 
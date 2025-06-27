import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Shield, FileText, Globe, Zap, Lock } from "lucide-react";
import UploadDialog from "@/components/content/UploadDialog";
import BlockchainUploadDialog from "@/components/content/BlockchainUploadDialog";
import { Badge } from "@/components/ui/badge";

export default function NewContent() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
          Upload & Protect Your Content
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
          Choose how you want to upload and protect your digital assets.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
        <Card className="relative">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
              Basic
            </Badge>
          </div>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Basic Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Upload files to secure cloud storage with basic protection features.
            </p>
            
            <div className="space-y-2 mb-3 sm:mb-4">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Features:</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>Secure Supabase cloud storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>File metadata extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>Access control & sharing</span>
                </li>
              </ul>
            </div>
            
            <UploadDialog />
          </CardContent>
        </Card>

        <Card className="relative border-purple-200">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
              Advanced
            </Badge>
          </div>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Blockchain Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Advanced protection using blockchain, IPFS, and cryptographic hashing.
            </p>
            
            <div className="space-y-2 mb-3 sm:mb-4">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Advanced Features:</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span>SHA-256 cryptographic hashing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>IPFS decentralized storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span>Polygon blockchain timestamping</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                  <span>Immutable proof of ownership</span>
                </li>
              </ul>
            </div>
            
            <BlockchainUploadDialog />
          </CardContent>
        </Card>
      </div>

      {/* Quick comparison */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl text-center">Protection Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Basic Upload</h4>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">50%</div>
              <p className="text-xs sm:text-sm text-gray-600">Protection Score</p>
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm sm:text-base">With IPFS</h4>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">75%</div>
              <p className="text-xs sm:text-sm text-gray-600">Protection Score</p>
            </div>
            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Full Blockchain</h4>
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">100%</div>
              <p className="text-xs sm:text-sm text-gray-600">Protection Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
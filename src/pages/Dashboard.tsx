import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, AlertTriangle, Search, Upload, Award, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardStats, useRecentContent, useRealtimeDashboard } from "@/hooks/use-dashboard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DebugUpload from "@/components/DebugUpload";
import BlockchainUploadDialog from "@/components/content/BlockchainUploadDialog";
import { PiracyScanDialog } from "@/components/piracy/PiracyScanDialog";
import { PiracyScanDemo } from "@/components/piracy/PiracyScanDemo";
import { CertificateGenerationDialog } from "@/components/certificates/CertificateGenerationDialog";
import { CertificatesList } from "@/components/certificates/CertificatesList";
import { CertificateDemo } from "@/components/certificates/CertificateDemo";

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useDashboardStats();
  const { data: recentContent = [], isLoading: isContentLoading } = useRecentContent();
  const [searchQuery, setSearchQuery] = useState("");
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Enable real-time updates
  useRealtimeDashboard();

  const isLoading = isStatsLoading || isContentLoading;

  const filteredContent = recentContent.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header with Search and Add Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Protection Dashboard</h1>
          <p className="text-gray-500">Monitor and manage your content protection</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search protected content..."
              className="pl-8 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/dashboard/content/new")}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Basic Upload
            </Button>
            <BlockchainUploadDialog />
            <PiracyScanDialog />
            <Button 
              onClick={() => setCertificateDialogOpen(true)}
              variant="outline"
            >
              <Award className="mr-2 h-4 w-4" />
              Generate Certificate
            </Button>
          </div>
        </div>
      </div>

      {/* Blockchain Protection Demo */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Blockchain Protection Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">SHA-256 Hashing</h3>
              <p className="text-sm text-gray-600">Cryptographic fingerprinting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">IPFS Distribution</h3>
              <p className="text-sm text-gray-600">Decentralized storage</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Polygon Blockchain</h3>
              <p className="text-sm text-gray-600">Immutable timestamps</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Search className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold">AI Piracy Scan</h3>
              <p className="text-sm text-gray-600">Detect unauthorized copies</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold">PDF Certificates</h3>
              <p className="text-sm text-gray-600">Verifiable protection proof</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Piracy Detection Demo */}
      <PiracyScanDemo />

      {/* Certificate Generation Demo */}
      <CertificateDemo />

      {/* Certificates Section */}
      <CertificatesList onGenerateNew={() => setCertificateDialogOpen(true)} />

      {/* Debug Upload Tool */}
      <DebugUpload />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items Protected</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.protectedContent}</div>
            <p className="text-xs text-gray-500">
              {Math.round((stats?.protectedContent / stats?.totalContent) * 100)}% of total content
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Certificates</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCertificates || 0}</div>
            <p className="text-xs text-gray-500">
              Active blockchain certificates
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Piracy Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.violations}</div>
            <p className="text-xs text-gray-500">
              Detected this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.recentActivity.map(item => ({
                name: new Date(item.date).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric'
                }),
                "Protection Score": item.protectionScore,
                "Items Protected": item.itemsProtected,
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Protection Score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Items Protected"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Protected Content List */}
      <Card>
        <CardHeader>
          <CardTitle>Protected Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContent.length > 0 ? (
              filteredContent.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-gray-50 p-4 rounded-lg cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/content/${content.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{content.title}</p>
                    <p className="text-sm text-gray-500">
                      {content.type} • Protected on {new Date(content.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        content.status === "Protected"
                          ? "bg-green-100 text-green-700"
                          : content.status === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {content.status}
                    </span>
                    {content.blockchain_hash && (
                      <Shield className="h-4 w-4 text-green-600" />
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'No content matches your search.' : 'Get started by uploading your first content.'}
                </p>
                <div className="mt-6">
                  <BlockchainUploadDialog />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Generation Dialog */}
      <CertificateGenerationDialog 
        open={certificateDialogOpen}
        onOpenChange={setCertificateDialogOpen}
      />
    </div>
  );
} 
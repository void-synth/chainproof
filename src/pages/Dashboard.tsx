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

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useDashboardStats();
  const { data: recentContent = [], isLoading: isContentLoading } = useRecentContent();
  const [searchQuery, setSearchQuery] = useState("");
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
          <Button 
            onClick={() => navigate("/dashboard/content/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Add New Content
          </Button>
        </div>
      </div>

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
                      <Shield className="h-4 w-4 text-green-600" title="Blockchain Verified" />
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No content matches your search</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No protected content yet</p>
                <Button 
                  className="mt-4"
                  variant="outline"
                  onClick={() => navigate("/dashboard/content/new")}
                >
                  Protect Your First Content
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
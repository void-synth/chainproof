import { Shield, FileText, AlertTriangle, Search, Upload, Award, ChevronRight, TrendingUp, Eye, Globe, Zap, Lock, Database } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats, useRecentContent, useRealtimeDashboard } from "@/hooks/use-dashboard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DebugUpload from "@/components/DebugUpload";
import BlockchainUploadDialog from "@/components/content/BlockchainUploadDialog";
import { PiracyScanDialog } from "@/components/piracy/PiracyScanDialog";
import { PiracyScanDemo } from "@/components/piracy/PiracyScanDemo";
import { CertificateGenerationDialog } from "@/components/certificates/CertificateGenerationDialog";
import { CertificatesList } from "@/components/certificates/CertificatesList";
import { CertificateDemo } from "@/components/certificates/CertificateDemo";
import { cn } from "@/lib/utils";

// Responsive MetricCard component
const MetricCard = ({ title, value, change, changeType, trend, icon }: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };

  return (
    <Card className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <div className="flex items-baseline space-x-1 sm:space-x-2 mt-1">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{value}</p>
              {change && (
                <span className={cn("text-xs sm:text-sm font-medium", changeColors[changeType || 'neutral'])}>
                  <span className="hidden sm:inline">{trend && trendIcons[trend]} </span>
                  {change}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-2 sm:ml-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="scale-75 sm:scale-100">
                  {icon}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useDashboardStats();
  const { data: recentContent = [], isLoading: isContentLoading } = useRecentContent();
  const [searchQuery, setSearchQuery] = useState("");
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Enable real-time updates
  useRealtimeDashboard();

  // Update time every second for live feeling
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isLoading = isStatsLoading || isContentLoading;

  const filteredContent = recentContent.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock analytics data for enhanced charts
  const protectionTrendData = [
    { name: 'Jan', protected: 12, scanned: 8, certificates: 5 },
    { name: 'Feb', protected: 19, scanned: 15, certificates: 8 },
    { name: 'Mar', protected: 25, scanned: 22, certificates: 12 },
    { name: 'Apr', protected: 32, scanned: 28, certificates: 18 },
    { name: 'May', protected: 45, scanned: 38, certificates: 25 },
    { name: 'Jun', protected: 52, scanned: 45, certificates: 32 },
  ];

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center border-red-200 bg-red-50/50">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Failed to load dashboard data. Please check your connection and try again.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Loading Dashboard</h2>
              <p className="text-sm sm:text-base text-gray-600">Fetching your protection data...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Ultra-Responsive Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="py-3 sm:py-4 lg:py-6">
            
            {/* Title Section */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                    Protection Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Last updated: {currentTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Mobile Quick Actions */}
              <div className="flex sm:hidden items-center space-x-2">
                <Button 
                  onClick={() => setCertificateDialogOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2"
                >
                  <Award className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search and Actions Section */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isMobile ? "Search content..." : "Search protected content..."}
                  className="pl-10 w-full bg-white/70 backdrop-blur border-white/20 focus:bg-white focus:border-blue-300 h-10 sm:h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Desktop Action Buttons */}
              <div className="hidden sm:flex items-center gap-2 lg:gap-3 flex-shrink-0">
                <Button 
                  onClick={() => navigate("/dashboard/content/new")}
                  variant="outline"
                  size="sm"
                  className="bg-white/70 backdrop-blur border-white/20 hover:bg-white whitespace-nowrap"
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  <span className="hidden md:inline">Basic </span>Upload
                </Button>
                <BlockchainUploadDialog />
                <PiracyScanDialog />
                <Button 
                  onClick={() => setCertificateDialogOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white whitespace-nowrap"
                >
                  <Award className="h-4 w-4 mr-1.5" />
                  <span className="hidden lg:inline">Generate </span>Certificate
                </Button>
              </div>
              
              {/* Mobile Action Buttons - Grid Layout */}
              <div className="grid grid-cols-2 gap-2 sm:hidden">
                <Button 
                  onClick={() => navigate("/dashboard/content/new")}
                  variant="outline"
                  size="sm"
                  className="bg-white/70 backdrop-blur border-white/20 hover:bg-white justify-center"
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload
                </Button>
                
                <div className="flex">
                  <BlockchainUploadDialog />
                </div>
                
                <div className="flex">
                  <PiracyScanDialog />
                </div>
                
                <Button 
                  onClick={() => setCertificateDialogOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-center"
                >
                  <Award className="h-4 w-4 mr-1.5" />
                  Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Responsive Stats Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Protected"
            value={stats?.protectedContent || 0}
            change="+12%"
            changeType="positive"
            trend="up"
            icon={<Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />}
          />
          <MetricCard
            title="Active Certificates"
            value={stats?.totalCertificates || 0}
            change="+8%"
            changeType="positive"
            trend="up"
            icon={<Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />}
          />
          <MetricCard
            title="Piracy Alerts"
            value={stats?.violations || 0}
            change="-5%"
            changeType="positive"
            trend="down"
            icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />}
          />
          <MetricCard
            title="Scan Success Rate"
            value="98.5%"
            change="+2.1%"
            changeType="positive"
            trend="up"
            icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />}
          />
        </div>

        {/* Responsive Analytics Chart */}
        <Card className="p-3 sm:p-4 lg:p-6 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Protection Analytics</h3>
              <p className="text-sm sm:text-base text-gray-600">Track your content protection over time</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
                <Eye className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
          
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={protectionTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="protectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="scannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  fontSize={isMobile ? 12 : 14}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={isMobile ? 12 : 14}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                />
                <Area
                  type="monotone"
                  dataKey="protected"
                  stroke="#3B82F6"
                  strokeWidth={isMobile ? 2 : 3}
                  fillOpacity={1}
                  fill="url(#protectedGradient)"
                  name="Protected Items"
                />
                <Area
                  type="monotone"
                  dataKey="scanned"
                  stroke="#10B981"
                  strokeWidth={isMobile ? 2 : 3}
                  fillOpacity={1}
                  fill="url(#scannedGradient)"
                  name="Scanned Items"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Responsive Features Grid */}
        <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Blockchain Protection Features</h2>
            <p className="text-sm sm:text-base text-gray-600">Advanced digital asset protection powered by cutting-edge technology</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {[
              {
                icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "SHA-256 Hashing",
                description: "Cryptographic fingerprinting",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: <Database className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "IPFS Distribution",
                description: "Decentralized storage",
                gradient: "from-green-500 to-emerald-600"
              },
              {
                icon: <Lock className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "Polygon Blockchain",
                description: "Immutable timestamps",
                gradient: "from-purple-500 to-violet-600"
              },
              {
                icon: <Search className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "AI Piracy Scan",
                description: "Detect unauthorized copies",
                gradient: "from-red-500 to-pink-600"
              },
              {
                icon: <Award className="h-6 w-6 sm:h-8 sm:w-8" />,
                title: "PDF Certificates",
                description: "Verifiable protection proof",
                gradient: "from-yellow-500 to-orange-600"
              },
            ].map((feature, index) => (
              <Card 
                key={feature.title}
                className="group text-center p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 bg-white"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </Card>

        {/* Responsive Demo Sections */}
        <div className="grid gap-6 sm:gap-8 xl:grid-cols-2">
          <div className="space-y-6 sm:space-y-8">
            <PiracyScanDemo />
          </div>
          <div className="space-y-6 sm:space-y-8">
            <CertificateDemo />
          </div>
        </div>

        {/* Certificates Section */}
        <CertificatesList onGenerateNew={() => setCertificateDialogOpen(true)} />

        {/* Responsive Recent Activity */}
        <Card className="p-4 sm:p-6 bg-white/90 backdrop-blur border border-gray-200 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm sm:text-base text-gray-600">Latest protection and scan activities</p>
            </div>
            <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex-shrink-0">
              View All
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {filteredContent.slice(0, 5).map((content, index) => (
              <div 
                key={content.id}
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{content.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Protected {new Date(content.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  variant={content.status === 'protected' ? 'default' : 'secondary'}
                  className="capitalize flex-shrink-0 text-xs"
                >
                  {content.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Debug Section (conditionally shown) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Development Tools</h3>
            <DebugUpload />
          </Card>
        )}
      </div>

      {/* Certificate Generation Dialog */}
      <CertificateGenerationDialog 
        open={certificateDialogOpen}
        onOpenChange={setCertificateDialogOpen}
      />
    </div>
  );
} 
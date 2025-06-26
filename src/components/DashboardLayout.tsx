import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Home,
  FileText,
  Settings,
  Menu,
  X,
  User,
  ChevronRight,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Notifications from "./dashboard/Notifications";
import UserMenu from "./dashboard/UserMenu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const location = useLocation();

  // Detect mobile screen size and manage sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // Always open on desktop
        setShowMobileOverlay(false);
      } else {
        setIsSidebarOpen(false); // Closed by default on mobile
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile sidebar toggle
  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileOverlay(!showMobileOverlay);
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close mobile sidebar when clicking outside or navigating
  useEffect(() => {
    if (isMobile && showMobileOverlay) {
      setShowMobileOverlay(false);
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const navigationItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard", description: "Overview and analytics" },
    { name: "My Content", icon: FileText, path: "/dashboard/content", description: "Protected files and assets" },
    { name: "Profile", icon: User, path: "/dashboard/profile", description: "Account settings" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings", description: "Preferences and configuration" },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Mobile Overlay */}
      {isMobile && showMobileOverlay && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => {
            setShowMobileOverlay(false);
            setIsSidebarOpen(false);
          }}
        />
      )}

      {/* Responsive Enhanced Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out",
          "bg-white/95 backdrop-blur-lg border-r border-white/20 shadow-xl",
          // Mobile styles
          isMobile 
            ? cn(
                "w-72 sm:w-80",
                showMobileOverlay && isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )
            // Desktop styles  
            : cn(
                "w-64 lg:w-72 xl:w-80",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              )
        )}
      >
        <div className="flex h-full flex-col">
          {/* Responsive Sidebar Header */}
          <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate block">
                  ChainProof
                </span>
                <p className="text-xs text-gray-500 truncate">Digital Protection</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowMobileOverlay(false);
                setIsSidebarOpen(false);
              }}
              className="lg:hidden flex-shrink-0 ml-2"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Responsive Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 relative",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full" />
                  )}
                  
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 transition-all duration-200 flex-shrink-0",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200/50" 
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                  )}>
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm sm:text-base font-medium transition-colors truncate",
                      isActive ? "text-blue-900" : "text-gray-900"
                    )}>
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">
                      {item.description}
                    </p>
                  </div>
                  
                  {isActive && (
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Responsive Sidebar Footer */}
          <div className="p-3 sm:p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Protection Active</p>
                  <p className="text-xs text-gray-600 truncate">All systems operational</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Responsive Main Content Area */}
      <div className={cn(
        "transition-all duration-300",
        !isMobile && isSidebarOpen ? "lg:pl-64 xl:pl-72 2xl:pl-80" : ""
      )}>
        {/* Responsive Enhanced Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-white/20">
          <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "flex-shrink-0",
                  isMobile ? "" : "lg:hidden"
                )}
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Responsive Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm min-w-0 flex-1">
                <span className="text-gray-500 truncate">ChainProof</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <span className="font-medium text-gray-900 truncate">
                  {navigationItems.find(item => isActivePath(item.path))?.name || "Dashboard"}
                </span>
              </div>

              {/* Mobile title */}
              <div className="sm:hidden min-w-0 flex-1">
                <h1 className="text-base font-semibold text-gray-900 truncate">
                  {navigationItems.find(item => isActivePath(item.path))?.name || "Dashboard"}
                </h1>
              </div>
            </div>

            {/* Responsive Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Quick Search - Hidden on mobile */}
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 xl:w-64"
                />
              </div>

              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Notifications />
              </div>

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">{children}</main>

        {/* Responsive Footer */}
        <footer className="bg-white/50 backdrop-blur border-t border-white/20 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">ChainProof</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  © 2025 Digital Asset Protection Platform
                </span>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-gray-600">System Status: Operational</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
                  <span>Protected by</span>
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">Blockchain Technology</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 
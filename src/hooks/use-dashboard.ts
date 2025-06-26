import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React, { useEffect } from "react";

interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  type: string;
  status: string;
  protection_score: number;
  blockchain_hash: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityStats {
  protectionScore: number;
  itemsProtected: number;
}

interface DashboardStats {
  totalContent: number;
  protectedContent: number;
  totalCertificates: number;
  violations: number;
  recentActivity: {
    date: string;
    protectionScore: number;
    itemsProtected: number;
  }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        // Get current user with error logging
        const { data: authData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Auth error:", userError);
          throw new Error("Authentication error: " + userError.message);
        }
        if (!authData.user) {
          console.error("No user found in auth data");
          throw new Error("No authenticated user found");
        }

        console.log("Authenticated user:", authData.user.id);

        // Test database connection first
        const { data: testData, error: testError } = await supabase
          .from("content")
          .select("count")
          .limit(1);

        if (testError) {
          console.error("Database connection test failed:", testError);
          if (testError.message.includes("relation") || testError.message.includes("does not exist")) {
            throw new Error("Database tables not set up. Please run the initial migration.");
          }
          throw new Error("Database connection error: " + testError.message);
        }

        console.log("Database connection test successful");

        // Get all content for the user
        const { data: content, error: contentError } = await supabase
          .from("content")
          .select("*")
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false });

        if (contentError) {
          console.error("Content fetch error:", contentError);
          throw new Error("Failed to fetch content: " + contentError.message);
        }

        console.log("Content fetch successful:", content?.length || 0, "items");

        if (!content) return {
          totalContent: 0,
          protectedContent: 0,
          totalCertificates: 0,
          violations: 0,
          recentActivity: [],
        };

        const typedContent = content as ContentItem[];

        // Get violations this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: violations, error: violationsError } = await supabase
          .from("content")
          .select("id")
          .eq("user_id", authData.user.id)
          .eq("status", "Violated")
          .gte("updated_at", startOfMonth.toISOString());

        if (violationsError) {
          console.error("Violations fetch error:", violationsError);
          throw new Error("Failed to fetch violations: " + violationsError.message);
        }

        console.log("Violations fetch successful:", violations?.length || 0, "violations");

        // Group content by date for activity timeline
        const activityByDate = typedContent.reduce((acc, item) => {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = {
              protectionScore: item.protection_score || 0,
              itemsProtected: 1
            };
          } else {
            acc[date].protectionScore = (acc[date].protectionScore + (item.protection_score || 0)) / 2;
            acc[date].itemsProtected += 1;
          }
          return acc;
        }, {} as Record<string, ActivityStats>);

        // Calculate statistics
        const stats: DashboardStats = {
          totalContent: typedContent.length,
          protectedContent: typedContent.filter(item => item.status === "Protected").length,
          totalCertificates: typedContent.filter(item => item.blockchain_hash).length,
          violations: violations?.length || 0,
          recentActivity: Object.entries(activityByDate)
            .slice(-6)
            .map(([date, stats]) => ({
              date,
              protectionScore: Math.round(stats.protectionScore),
              itemsProtected: stats.itemsProtected,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };

        return stats;
      } catch (error) {
        console.error("Dashboard stats error:", error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });
}

// Get recent content with more details
export function useRecentContent() {
  return useQuery({
    queryKey: ["recent-content"],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Auth error:", userError);
          throw new Error("Authentication error: " + userError.message);
        }
        if (!user) {
          console.error("No user found");
          throw new Error("No authenticated user found");
        }

        const { data, error } = await supabase
          .from("content")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Recent content fetch error:", error);
          throw new Error("Failed to fetch recent content: " + error.message);
        }

        console.log("Recent content fetch successful:", data?.length || 0, "items");
        return data || [];
      } catch (error) {
        console.error("Recent content error:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });
}

// Enable real-time updates for dashboard data
export function useRealtimeDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("⚠️ Realtime dashboard updates temporarily disabled due to connection issues");
    
    // TODO: Re-enable once realtime connection issues are resolved
    /*
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'content' },
        (payload) => {
          console.log('Content table change:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-content'] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
    */
    
    // Return cleanup function that does nothing for now
    return () => {};
  }, [queryClient]);
} 
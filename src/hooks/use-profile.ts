import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Get current user's profile
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}

// Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      console.log("🔄 Starting profile update with data:", data);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("❌ Auth error:", userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        console.error("❌ No user found");
        throw new Error("No user found");
      }
      
      console.log("✅ User authenticated:", user.id);

      // Update email in auth if it's being changed
      if (data.email && data.email !== user.email) {
        console.log("📧 Updating email in auth...");
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailError) {
          console.error("❌ Email update error:", emailError);
          throw new Error(`Failed to update email: ${emailError.message}`);
        }
        console.log("✅ Email updated in auth");
      }

      // Update profile data
      console.log("💾 Updating profile data...");
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("❌ Profile update error:", error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      
      console.log("✅ Profile updated successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    },
  });
}

// Upload avatar
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      console.log("🖼️ Starting avatar upload for file:", file.name, "Size:", file.size);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("❌ Auth error:", userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        console.error("❌ No user found");
        throw new Error("No user found");
      }
      
      console.log("✅ User authenticated:", user.id);

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error("File must be an image");
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 5MB");
      }

      // Delete old avatar if exists
      const { data: oldProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (oldProfile?.avatar_url) {
        const oldFileName = oldProfile.avatar_url.split("/").pop();
        if (oldFileName) {
          console.log("🗑️ Deleting old avatar:", oldFileName);
          await supabase.storage
            .from("avatars")
            .remove([oldFileName]);
        }
      }

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      console.log("📤 Uploading to storage:", fileName);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("❌ Storage upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log("✅ File uploaded successfully");

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
        
      console.log("🔗 Generated public URL:", publicUrl);

      // Update profile with new avatar URL
      console.log("💾 Updating profile with new avatar URL...");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("❌ Profile update error:", updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      console.log("✅ Avatar updated successfully");
      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update avatar",
      });
    },
  });
}

// Delete avatar
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get current avatar URL
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (profile?.avatar_url) {
        // Extract filename from URL
        const fileName = profile.avatar_url.split("/").pop();
        
        // Delete file from storage
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([fileName!]);

        if (deleteError) throw deleteError;
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Avatar removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove avatar",
      });
    },
  });
} 
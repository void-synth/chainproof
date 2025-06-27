import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload, Trash } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/use-profile";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
});

export default function Profile() {
  const [isUploading, setIsUploading] = useState(false);
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      company: profile?.company || "",
    },
    values: {
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      company: profile?.company || "",
    },
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit for avatars)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      await uploadAvatar.mutateAsync(file);
      // Clear the input so the same file can be selected again
      event.target.value = '';
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    await deleteAvatar.mutateAsync();
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    await updateProfile.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-gray-500 mt-1 sm:mt-2">Manage your account settings</p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-lg sm:text-xl">
                {profile?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">Upload New</span>
                <span className="sm:hidden">Upload</span>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </Button>
              {profile?.avatar_url && (
                <Button
                  variant="outline"
                  onClick={handleAvatarDelete}
                  disabled={deleteAvatar.isPending}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name" 
                            {...field} 
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            {...field} 
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-sm sm:text-base">Company</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your company" 
                            {...field} 
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
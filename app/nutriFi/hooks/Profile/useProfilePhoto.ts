import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";

export function useProfilePhoto(profileId: string | null) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load the current avatar URL from the profile
  const loadAvatar = useCallback(async () => {
    if (!profileId) return;

    const { data, error } = await supabase
      .from("profile")
      .select("avatar_url")
      .eq("id", profileId)
      .single();

    if (!error && data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  }, [profileId]);

  // Pick image from camera roll and upload to Supabase Storage
  const pickAndUpload = useCallback(async () => {
    if (!profileId) return;

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access photos is required.");
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    const image = result.assets[0];
    setUploading(true);

    try {
      // Get file extension from URI
      const ext = image.uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${profileId}/avatar.${ext}`;

      // Fetch the image as a blob
      const response = await fetch(image.uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer for Supabase upload
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage (upsert to overwrite existing)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: image.mimeType ?? `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Failed to upload photo. Please try again.");
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Save URL to profile table
      const { error: updateError } = await supabase
        .from("profile")
        .update({ avatar_url: publicUrl })
        .eq("id", profileId);

      if (updateError) {
        console.error("Profile update error:", updateError);
        alert("Photo uploaded but failed to save to profile.");
        return;
      }

      // Add cache-busting query param so the image refreshes
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [profileId]);

  return {
    avatarUrl,
    uploading,
    loadAvatar,
    pickAndUpload,
  };
}
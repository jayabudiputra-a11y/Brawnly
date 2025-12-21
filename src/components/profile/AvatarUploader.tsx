import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  userId: string;
  currentAvatarUrl?: string | null;
  onUploaded?: (url: string) => void;
};

const AvatarUploader = ({
  userId,
  currentAvatarUrl,
  onUploaded,
}: Props) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setError(null);

      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // upload ke storage
      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      // ambil public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // update profile
      const { error: updateError } =
        await supabase
          .from("user_profiles")
          .update({
            avatar_url: publicUrl,
          })
          .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      onUploaded?.(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <img
          src={
            currentAvatarUrl ??
            "/avatar-placeholder.png"
          }
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover border"
        />

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
            disabled={uploading}
          />
          <span className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
            {uploading ? "Uploading..." : "Change Avatar"}
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default AvatarUploader;

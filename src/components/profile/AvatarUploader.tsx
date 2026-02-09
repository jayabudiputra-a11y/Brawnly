import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Camera, Save, User } from "lucide-react";
import { getOptimizedImage } from "@/lib/utils";

type Props = {
  userId: string;
  currentAvatarUrl?: string | null;
  currentUsername?: string;
  onUploaded?: (url: string) => void;
  onUsernameUpdated?: (name: string) => void;
};

const AvatarUploader = ({
  userId,
  currentAvatarUrl,
  currentUsername,
  onUploaded,
  onUsernameUpdated,
}: Props) => {
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState(currentUsername || "");
  const [updatingName, setUpdatingName] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username === currentUsername) return;

    setUpdatingName(true);
    setError(null);

    try {
      const { error: updateProfileError } = await supabase
        .from("user_profiles")
        .update({ username })
        .eq("id", userId);

      if (updateProfileError) throw updateProfileError;

      await supabase.auth.updateUser({
        data: { full_name: username },
      });

      onUsernameUpdated?.(username);
    } catch (err: any) {
      setError(err.message ?? "Update name failed");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        throw new Error("Only images allowed");
      }

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '31536000', 
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const optimizedUrlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      await supabase
        .from("user_profiles")
        .update({ avatar_url: optimizedUrlWithCacheBust })
        .eq("id", userId);

      await supabase.auth.updateUser({
        data: { avatar_url: optimizedUrlWithCacheBust },
      });

      onUploaded?.(optimizedUrlWithCacheBust);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-3">
        <div className="relative group">
          <motion.div
             whileHover={{ scale: 1.05 }}
             className="relative overflow-hidden rounded-full w-28 h-28 border-4 border-white dark:border-neutral-800 shadow-lg"
          >
             <img
              src={
                currentAvatarUrl 
                  ? getOptimizedImage(currentAvatarUrl, 200)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentUsername || "U"
                    )}&background=random&color=fff`
              }
              alt="User Avatar"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ease-in-out"
              width="112"
              height="112"
            />
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Camera className="text-white w-8 h-8" />
            </div>
          </motion.div>

          <label className="absolute bottom-0 right-0 p-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-full cursor-pointer shadow-lg border border-white/20 dark:border-black/10 active:scale-90 transition z-10">
            <Camera size={18} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
              disabled={uploading}
              aria-label="Upload profile picture"
            />
          </label>
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
          {uploading ? "UPLOADING..." : "TAP TO CHANGE AVATAR"}
        </p>
      </div>

      <form
        onSubmit={handleUpdateName}
        className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3"
      >
        <label htmlFor="username-input" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-700 dark:text-neutral-300">
          <User size={12} className="text-emerald-500" />
          Username
        </label>

        <div className="flex items-center gap-2 min-h-[44px]">
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="flex-1 min-w-0 h-[44px] rounded-xl px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-sm font-bold text-neutral-900 dark:text-white outline-none transition"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={updatingName || !username || username === currentUsername}
            className="h-[44px] px-4 rounded-xl shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
          >
            {updatingName ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={14} />
                <span className="hidden xs:inline">Save</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {error && (
        <p className="text-[10px] font-bold uppercase text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-900/30">
          {error}
        </p>
      )}
    </div>
  );
};

export default AvatarUploader;
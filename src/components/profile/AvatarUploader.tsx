import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Camera, Save, User } from "lucide-react";

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
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await supabase
        .from("user_profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      onUploaded?.(publicUrl);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* AVATAR SECTION */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={
              currentAvatarUrl ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUsername || "U"
              )}&background=random&color=fff`
            }
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-lg"
          />

          <label className="absolute bottom-0 right-0 p-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-full cursor-pointer shadow-lg border border-white/20 dark:border-black/10 active:scale-90 transition">
            <Camera size={18} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
          {uploading ? "UPLOADING..." : "TAP THIS TO ADD.."}
        </p>
      </div>

      {/* USERNAME CARD - Perbaikan pada layout input & button */}
      <form
        onSubmit={handleUpdateName}
        className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3"
      >
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-700 dark:text-neutral-300">
          <User size={12} className="text-emerald-500" />
          Username
        </label>

        <div className="flex items-center gap-2 min-h-[44px]">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="
              flex-1 min-w-0 h-[44px] rounded-xl px-3
              bg-neutral-50 dark:bg-neutral-800
              border border-neutral-300 dark:border-neutral-700
              text-sm font-bold
              text-neutral-900 dark:white
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
              outline-none transition
            "
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={updatingName || !username || username === currentUsername}
            className="
              h-[44px] px-4 rounded-xl shrink-0
              bg-emerald-500 hover:bg-emerald-600
              text-white font-black uppercase text-[10px] tracking-widest
              disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
              shadow-md
            "
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
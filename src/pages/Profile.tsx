import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import AvatarUploader from "@/components/profile/AvatarUploader";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "@/types";
import { getOptimizedImage } from "@/lib/utils";

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setIsDataReady(true);
        return;
      }

      if (error) {
        const defaultUsername = `user_${user.id.substring(0, 8)}`;

        const { data: newData, error: insertError } = await supabase
          .from("user_profiles")
          .upsert(
            {
              id: user.id,
              username: defaultUsername,
              avatar_url: null,
            },
            { onConflict: "id" }
          )
          .select();

        if (newData && !insertError) {
          const rows = (Array.isArray(newData) ? newData : [newData]) as UserProfile[];
          if (rows.length > 0) {
            setProfile(rows[0]);
            setIsDataReady(true);
          }
        }
      }
    };

    initProfile();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/subscribe");
    }
  }, [loading, user, navigate]);

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: url });
    }
  };

  const handleUsernameUpdate = (newUsername: string) => {
    if (profile) {
      setProfile({ ...profile, username: newUsername });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm font-black uppercase tracking-widest animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!isDataReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm font-black uppercase tracking-widest">Setting up your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none border border-neutral-100 dark:border-neutral-800 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">My Profile</h1>
          <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Customize your identity</p>
          
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">
              Registered Email
            </p>
            <p className="text-sm text-emerald-900 dark:text-emerald-200 font-bold">{user.email}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <AvatarUploader
            userId={user.id}
            currentAvatarUrl={profile?.avatar_url ? getOptimizedImage(profile.avatar_url, 200) : null}
            currentUsername={profile?.username}
            onUploaded={handleAvatarUpdate}
            onUsernameUpdated={handleUsernameUpdate}
          />
        </div>

        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
          Changes are synced with brawnly cloud
        </div>
      </div>
    </div>
  );
};

export default Profile;
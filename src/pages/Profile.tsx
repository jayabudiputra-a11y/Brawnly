import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import AvatarUploader from "@/components/profile/AvatarUploader";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "@/types";

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
          );

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
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!isDataReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Setting up your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600">Customize your identity</p>
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded">
            <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
              Email
            </p>
            <p className="text-sm text-emerald-700">{user.email}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <AvatarUploader
            userId={user.id}
            currentAvatarUrl={profile?.avatar_url}
            currentUsername={profile?.username}
            onUploaded={handleAvatarUpdate}
            onUsernameUpdated={handleUsernameUpdate}
          />
        </div>

        <div className="text-xs text-gray-400 text-center">
          Changes are saved automatically.
        </div>
      </div>
    </div>
  );
};

export default Profile;

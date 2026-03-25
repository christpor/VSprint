import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getProfile, updateProfile, uploadAvatar, getAvatarUrl, deleteAvatar } from '../services/profileService';
import { User, Camera, Loader2, Trash2 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const ProfileAvatar = ({ user }: { user: SupabaseUser }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvatar();
  }, [user.id]);

  const fetchAvatar = async () => {
    try {
      setLoading(true);
      const profile = await getProfile(user.id);
      if (profile?.avatar_url) {
        const signedUrl = await getAvatarUrl(profile.avatar_url);
        setAvatarUrl(signedUrl);
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const profile = await getProfile(user.id);
      if (profile?.avatar_url) {
        await deleteAvatar(profile.avatar_url);
      }

      const path = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { avatar_url: path });
      await fetchAvatar();
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const profile = await getProfile(user.id);
      if (profile?.avatar_url) {
        await deleteAvatar(profile.avatar_url);
        await updateProfile(user.id, { avatar_url: null });
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-slate-400" />
        )}
      </div>
      <label className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-700">
        <Camera className="w-3 h-3 text-slate-600 dark:text-slate-300" />
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
      </label>
      {avatarUrl && (
        <button 
          onClick={handleDelete}
          className="absolute -top-1 -right-1 p-1 bg-red-100 dark:bg-red-900/30 rounded-full border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50"
          disabled={loading}
        >
          <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
        </button>
      )}
    </div>
  );
};

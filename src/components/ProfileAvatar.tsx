import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getProfile, updateProfile, uploadAvatar, getAvatarUrl, deleteAvatar } from '../services/profileService';
import { User, Camera, Loader2, Trash2 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const ProfileAvatar = ({ user }: { user: SupabaseUser }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvatar();
  }, [user.id]);

  const fetchAvatar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Try to get custom avatar from profile
      const profile = await getProfile(user.id);
      if (profile?.avatar_url) {
        const signedUrl = await getAvatarUrl(profile.avatar_url);
        setAvatarUrl(signedUrl);
        return;
      }

      // 2. Fallback to Google avatar from metadata
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      if (googleAvatar) {
        setAvatarUrl(googleAvatar);
        return;
      }

      setAvatarUrl(null);
    } catch (err) {
      console.error('Error fetching avatar:', err);
      // Don't show error to user if it's just a profile fetch failure, 
      // just fallback to default icon
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setError(null);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (e.g., 2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size too large. Max 2MB.');
        return;
      }

      const profile = await getProfile(user.id);
      if (profile?.avatar_url) {
        try {
          await deleteAvatar(profile.avatar_url);
        } catch (delErr) {
          console.warn('Could not delete old avatar, proceeding with upload:', delErr);
        }
      }

      const path = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { avatar_url: path });
      await fetchAvatar();
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getProfile(user.id);
      if (profile?.avatar_url) {
        await deleteAvatar(profile.avatar_url);
        await updateProfile(user.id, { avatar_url: null });
        setAvatarUrl(null);
      }
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setError('Failed to delete avatar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group flex flex-col items-center">
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <label className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm">
          <Camera className="w-3 h-3 text-slate-600 dark:text-slate-300" />
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>
        {avatarUrl && (
          <button 
            onClick={handleDelete}
            className="absolute -top-1 -right-1 p-1 bg-red-100 dark:bg-red-900/30 rounded-full border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50 shadow-sm"
            disabled={loading}
          >
            <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
          </button>
        )}
      </div>
      {error && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 text-center">
          <p className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-900/30">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

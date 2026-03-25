import { supabase } from '../supabaseClient';

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: { avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatars/${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('app-files')
    .upload(fileName, file);
    
  if (uploadError) throw uploadError;
  
  return fileName;
};

export const getAvatarUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('app-files')
    .createSignedUrl(path, 3600); // 1 hour expiry
    
  if (error) throw error;
  return data.signedUrl;
};

export const deleteAvatar = async (path: string) => {
  const { error } = await supabase.storage
    .from('app-files')
    .remove([path]);
    
  if (error) throw error;
};

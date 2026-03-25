import { supabase } from '../supabaseClient';
import { InteractionType } from '../App';

export const getInteractions = async (userId: string) => {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createInteraction = async (userId: string, prompt: string) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert({ user_id: userId, prompt })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateInteraction = async (id: string, response: any) => {
  const { data, error } = await supabase
    .from('interactions')
    .update({ response })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteInteraction = async (id: string) => {
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

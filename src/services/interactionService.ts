import { supabase } from '../supabaseClient';
import { InteractionType } from '../App';

export const getInteractions = async (userId: string, conversationId?: string) => {
  let query = supabase
    .from('interactions')
    .select('*')
    .eq('user_id', userId);
  
  if (conversationId) {
    query = query.eq('conversation_id', conversationId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const createInteraction = async (userId: string, conversationId: string, prompt: string) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert({ user_id: userId, conversation_id: conversationId, prompt })
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

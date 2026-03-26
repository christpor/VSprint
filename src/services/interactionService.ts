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

export const createInteraction = async (userId: string, conversationId: string, prompt: string, id?: string) => {
  const payload: any = { user_id: userId, conversation_id: conversationId, prompt };
  if (id) payload.id = id;
  
  const { data, error } = await supabase
    .from('interactions')
    .insert(payload)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateInteraction = async (id: string, response: any) => {
  // First check if the record exists to avoid 400/404 errors if it was never saved
  const { data: existing } = await supabase
    .from('interactions')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    console.warn(`Interaction ${id} not found in DB, skipping update.`);
    return null;
  }

  const { data, error } = await supabase
    .from('interactions')
    .update({ response })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating interaction:', error);
    throw error;
  }
  return data;
};

export const deleteInteraction = async (id: string) => {
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

import { supabase } from '../lib/supabase';

export interface Syndic {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  favori: boolean;
  created_at: string;
  updated_at: string;
}

export async function getSyndics(): Promise<Syndic[]> {
  try {
    const { data, error } = await supabase
      .from('syndics')
      .select('*')
      .order('nom');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching syndics:', error);
    throw error;
  }
}

export async function searchSyndics(query: string): Promise<Syndic[]> {
  try {
    const { data, error } = await supabase
      .from('syndics')
      .select('*')
      .ilike('nom', `%${query}%`)
      .order('nom')
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching syndics:', error);
    throw error;
  }
}

export async function addSyndic(syndic: Omit<Syndic, 'id' | 'created_at' | 'updated_at'>): Promise<Syndic> {
  try {
    const { data, error } = await supabase
      .from('syndics')
      .insert([syndic])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding syndic:', error);
    throw error;
  }
}

export async function updateSyndic(id: string, updates: Partial<Syndic>): Promise<Syndic> {
  try {
    const { data, error } = await supabase
      .from('syndics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating syndic:', error);
    throw error;
  }
}

export async function deleteSyndic(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('syndics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting syndic:', error);
    throw error;
  }
}

export async function toggleSyndicFavori(id: string, favori: boolean): Promise<Syndic> {
  try {
    const { data, error } = await supabase
      .from('syndics')
      .update({ favori })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling syndic favori:', error);
    throw error;
  }
}
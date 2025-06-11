import { supabase } from '../lib/supabase';

export interface Notaire {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  favori: boolean;
  created_at: string;
  updated_at: string;
}

export async function getNotaires(): Promise<Notaire[]> {
  try {
    const { data, error } = await supabase
      .from('notaires')
      .select('*')
      .order('nom');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notaires:', error);
    throw error;
  }
}

export async function searchNotaires(query: string): Promise<Notaire[]> {
  try {
    const { data, error } = await supabase
      .from('notaires')
      .select('*')
      .ilike('nom', `%${query}%`)
      .order('nom')
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching notaires:', error);
    throw error;
  }
}

export async function addNotaire(notaire: Omit<Notaire, 'id' | 'created_at' | 'updated_at'>): Promise<Notaire> {
  try {
    const { data, error } = await supabase
      .from('notaires')
      .insert([notaire])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding notaire:', error);
    throw error;
  }
}

export async function updateNotaire(id: string, updates: Partial<Notaire>): Promise<Notaire> {
  try {
    const { data, error } = await supabase
      .from('notaires')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating notaire:', error);
    throw error;
  }
}

export async function deleteNotaire(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notaires')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting notaire:', error);
    throw error;
  }
}

export async function toggleNotaireFavori(id: string, favori: boolean): Promise<Notaire> {
  try {
    const { data, error } = await supabase
      .from('notaires')
      .update({ favori })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling notaire favori:', error);
    throw error;
  }
}
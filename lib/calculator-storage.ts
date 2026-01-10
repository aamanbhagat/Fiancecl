import { supabase } from './supabase';
import type { Calculation } from './supabase';

/**
 * Save a calculation to the database
 */
export async function saveCalculation(data: {
  calculator_type: string;
  scenario_name?: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  notes?: string;
}): Promise<Calculation | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Must be logged in to save calculations');
  }

  const { data: calculation, error } = await supabase
    .from('calculations')
    .insert({
      user_id: user.id,
      calculator_type: data.calculator_type,
      scenario_name: data.scenario_name || null,
      inputs: data.inputs,
      results: data.results,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return calculation;
}

/**
 * Get all calculations for the current user
 */
export async function getUserCalculations(calculator_type?: string): Promise<Calculation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  let query = supabase
    .from('calculations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (calculator_type) {
    query = query.eq('calculator_type', calculator_type);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Delete a calculation
 */
export async function deleteCalculation(id: string): Promise<void> {
  const { error } = await supabase
    .from('calculations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('calculations')
    .update({ is_favorite: isFavorite })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Update calculation scenario name
 */
export async function updateCalculationName(id: string, scenarioName: string): Promise<void> {
  const { error } = await supabase
    .from('calculations')
    .update({ scenario_name: scenarioName })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get a single calculation by ID
 */
export async function getCalculation(id: string): Promise<Calculation | null> {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get favorite calculations
 */
export async function getFavoriteCalculations(): Promise<Calculation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get calculation statistics
 */
export async function getCalculationStats(): Promise<{
  total: number;
  by_type: Record<string, number>;
  favorites: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { total: 0, by_type: {}, favorites: 0 };

  const { data, error } = await supabase
    .from('calculations')
    .select('calculator_type, is_favorite')
    .eq('user_id', user.id);

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    by_type: {} as Record<string, number>,
    favorites: 0,
  };

  data?.forEach((calc) => {
    stats.by_type[calc.calculator_type] = (stats.by_type[calc.calculator_type] || 0) + 1;
    if (calc.is_favorite) stats.favorites++;
  });

  return stats;
}

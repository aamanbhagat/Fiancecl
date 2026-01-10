import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database
export type Calculation = {
  id: string;
  user_id: string;
  calculator_type: string;
  scenario_name: string | null;
  inputs: Record<string, any>;
  results: Record<string, any>;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type ComparisonGroup = {
  id: string;
  user_id: string;
  name: string;
  calculator_type: string;
  created_at: string;
};

export type ComparisonItem = {
  id: string;
  group_id: string;
  calculation_id: string;
  order_index: number;
  created_at: string;
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozarxtmjrinvastjakjf.supabase.co';
const supabaseAnonKey = 'sb_publishable_pulKAguty_7LVknkxppHdQ_RJ7myV61';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

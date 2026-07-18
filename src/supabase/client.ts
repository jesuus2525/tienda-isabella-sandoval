import { createClient } from '@supabase/supabase-js';

// Leemos las variables secretas que guardamos en el archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos y exportamos la conexión lista para usarse
export const supabase = createClient(supabaseUrl, supabaseKey);
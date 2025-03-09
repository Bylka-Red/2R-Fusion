import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://amnkxkjizdfewigmeopn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtbmt4a2ppemRmZXdpZ21lb3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NjYyNzksImV4cCI6MjA1NzA0MjI3OX0.3m_kotWcsQKeWtZIOFSptUu3EmjtXEz1VvfrpXjPXcM';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
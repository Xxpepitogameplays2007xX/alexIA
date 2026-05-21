import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://emrsowjmtqngwpqfjtbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcnNvd2ptdHFuZ3dwcWZqdGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTczMjUsImV4cCI6MjA5MDI5MzMyNX0.Z3s6j7417bJp2-aRSsDfSgLdBPjElUS6GELI2CgqFIQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mddiiwxnhltypnyqmoae.supabase.co'
const supabaseAnonKey = 'sb_publishable_pQ61yU5vr93BBDMt1UL9OQ_A5BwVYAg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
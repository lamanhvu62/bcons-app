import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const expoExtra: any = (Constants as any).manifest?.extra ?? (Constants as any).expoConfig?.extra ?? {};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? expoExtra.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? expoExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Debug info to help diagnose network/env issues (won't print anon key)
console.log('Supabase config present:', hasSupabaseConfig);
console.log('Supabase URL (first 80 chars):', supabaseUrl ? supabaseUrl.slice(0, 80) : '(empty)');

let supabaseClient: any;
if (hasSupabaseConfig) {
	supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
	// safe stub to avoid runtime crash when env vars are missing
	supabaseClient = {
		auth: {
			async getSession() {
				return { data: { session: null } };
			},
			onAuthStateChange(_: any) {
				return { data: { subscription: { unsubscribe: () => {} } } };
			},
			async signInWithPassword() {
				return { error: { message: 'Missing Supabase configuration' } };
			},
			async signUp() {
				return { error: { message: 'Missing Supabase configuration' } };
			},
			async signOut() {
				return { error: { message: 'Missing Supabase configuration' } };
			},
		},
		from: (_table: string) => ({
			select: (_q?: string) => ({
				order: (_col: string, _opts?: any) => ({
					limit: async (_n?: number) => ({ data: null, error: { message: 'Missing Supabase configuration' } }),
				}),
			}),
		}),
	};
}

export const supabase = supabaseClient;

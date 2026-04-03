import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseMissing = !supabaseUrl || !supabaseAnonKey;

export const supabase: SupabaseClient = supabaseMissing
  ? (null as unknown as SupabaseClient)
  : createClient(supabaseUrl, supabaseAnonKey);

/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
export function getLocalToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

/** Plays an 800 Hz bell tone for 300ms using the Web Audio API. */
export function playChime() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 800;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    oscillator.onended = () => ctx.close();
  } catch {
    // Web Audio API not available — ignore silently
  }
}

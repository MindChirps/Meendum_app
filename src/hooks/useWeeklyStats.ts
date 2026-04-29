import { useState, useEffect, useCallback } from 'react';
import { supabase, getLocalToday, getDateDaysAgo } from '../lib/supabase';

export interface DaySummary {
  date: string;
  completed: number;
  skipped: number;
  painSkips: number;
  fatigueSkips: number;
  totalDuration: number;
}

export interface WeeklyStats {
  days: DaySummary[];
  currentStreak: number;
  bestStreak: number;
  weeklyRate: number;
  monthlyCompleted: number;
  monthlyPainSkips: number;
  monthlyFatigueSkips: number;
  loading: boolean;
  error: string | null;
}

export function useWeeklyStats(totalTasksPerDay: number): WeeklyStats {
  const [stats, setStats] = useState<WeeklyStats>({
    days: [],
    currentStreak: 0,
    bestStreak: 0,
    weeklyRate: 0,
    monthlyCompleted: 0,
    monthlyPainSkips: 0,
    monthlyFatigueSkips: 0,
    loading: true,
    error: null
  });

  const compute = useCallback(async () => {
    const today = getLocalToday();
    const thirtyDaysAgo = getDateDaysAgo(30);

    const { data, error } = await supabase
      .from('completions')
      .select('task_id, date, status, skip_reason, duration_seconds')
      .gte('date', thirtyDaysAgo)
      .lte('date', today)
      .order('date', { ascending: true });

    if (error) {
      setStats(prev => ({ ...prev, loading: false, error: 'போக்கு தரவைப் பெற இயலவில்லை' }));
      return;
    }

    const rows = data || [];

    // Deduplicate: per (task_id, date), prefer 'completed' over 'skipped'
    const bestLog = new Map<string, { status: string; skip_reason: string | null; duration_seconds: number | null }>();
    for (const r of rows) {
      const key = `${r.task_id}::${r.date}`;
      const existing = bestLog.get(key);
      if (!existing || (r.status === 'completed' && existing.status === 'skipped')) {
        bestLog.set(key, r);
      }
    }

    // Group by date
    const byDate = new Map<string, DaySummary>();
    for (const [key, r] of bestLog) {
      const date = key.split('::')[1];
      let day = byDate.get(date);
      if (!day) {
        day = { date, completed: 0, skipped: 0, painSkips: 0, fatigueSkips: 0, totalDuration: 0 };
        byDate.set(date, day);
      }
      if (r.status === 'completed') {
        day.completed++;
        day.totalDuration += r.duration_seconds || 0;
      } else if (r.status === 'skipped') {
        day.skipped++;
        if (r.skip_reason === 'pain') day.painSkips++;
        if (r.skip_reason === 'fatigue') day.fatigueSkips++;
      }
    }

    // Build last 7 days array
    const days: DaySummary[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = getDateDaysAgo(i);
      days.push(byDate.get(date) || { date, completed: 0, skipped: 0, painSkips: 0, fatigueSkips: 0, totalDuration: 0 });
    }

    // Current streak: walk backwards from today
    let currentStreak = 0;
    for (let i = 0; i <= 30; i++) {
      const date = getDateDaysAgo(i);
      const day = byDate.get(date);
      if (day && day.completed > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Best streak in 30-day window
    let bestStreak = 0;
    let tempStreak = 0;
    for (let i = 30; i >= 0; i--) {
      const date = getDateDaysAgo(i);
      const day = byDate.get(date);
      if (day && day.completed > 0) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Weekly rate
    const weekCompleted = days.reduce((s, d) => s + d.completed, 0);
    const weeklyRate = totalTasksPerDay > 0
      ? Math.round((weekCompleted / (totalTasksPerDay * 7)) * 100)
      : 0;

    // Monthly totals
    let monthlyCompleted = 0;
    let monthlyPainSkips = 0;
    let monthlyFatigueSkips = 0;
    for (const day of byDate.values()) {
      monthlyCompleted += day.completed;
      monthlyPainSkips += day.painSkips;
      monthlyFatigueSkips += day.fatigueSkips;
    }

    setStats({
      days,
      currentStreak,
      bestStreak,
      weeklyRate,
      monthlyCompleted,
      monthlyPainSkips,
      monthlyFatigueSkips,
      loading: false,
      error: null
    });
  }, [totalTasksPerDay]);

  useEffect(() => {
    compute();
  }, [compute]);

  return stats;
}

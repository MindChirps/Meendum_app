import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useCurrentSession } from '../hooks/useCurrentSession';
import { useSessionTasks } from '../hooks/useSessionTasks';
import { HemiparesisFigure } from '../components/HemiparesisFigure';
import { PostureBadge } from '../components/PostureBadge';
import { BreathingAnimation } from '../components/BreathingAnimation';
import { RestScreen } from '../components/RestScreen';
import { supabase, playChime, getLocalToday } from '../lib/supabase';
import type { SkipReason } from '../types/database';

type FlowState = 'idle' | 'active' | 'skip-reason';

export function AppaScreen() {
  const { appState, loading: stateLoading, error: stateError } = useAppState();
  const session = useCurrentSession();
  const { tasks, loading: tasksLoading, error: tasksError, refetch } = useSessionTasks(session);

  const [flow, setFlow] = useState<FlowState>('idle');
  const [busy, setBusy] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const currentTask = tasks[0] || null;

  const handleStart = () => {
    if (!currentTask) return;
    startTimeRef.current = Date.now();
    setFlow('active');
  };

  const handleDone = async () => {
    if (!currentTask || busy) return;
    setBusy(true);
    playChime();

    const durationSec = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : null;

    await supabase.from('completions').insert({
      task_id: currentTask.id,
      date: getLocalToday(),
      duration_seconds: durationSec,
      status: 'completed'
    });

    startTimeRef.current = null;
    setFlow('idle');
    setBusy(false);
    refetch();
  };

  const handleSkipPress = () => {
    setFlow('skip-reason');
  };

  const handleSkipReason = async (reason: SkipReason) => {
    if (!currentTask || busy) return;
    setBusy(true);

    await supabase.from('completions').insert({
      task_id: currentTask.id,
      date: getLocalToday(),
      status: 'skipped',
      skip_reason: reason
    });

    setFlow('idle');
    setBusy(false);
    refetch();
  };

  // ----- States -----

  if (stateLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-5xl">⏳</div>
      </div>
    );
  }

  const displayError = stateError || tasksError;
  if (displayError) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-3xl text-center text-red-700">{displayError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-8 py-4 bg-yellow-600 text-white text-2xl rounded-xl"
        >
          மீண்டும் முயற்சி
        </button>
      </div>
    );
  }

  // Amma has hit the SOS rest button
  if (appState?.mode === 'rest') {
    return <RestScreen />;
  }

  // Outside session hours (before 6 AM or after 9 PM)
  if (!session) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-7xl">🌙</div>
        <h1 className="text-4xl font-bold text-center text-gray-900">
          இப்போது பயிற்சி நேரம் இல்லை
        </h1>
        <p className="text-2xl text-center text-gray-600">
          ஓய்வு எடுங்கள்
        </p>
      </div>
    );
  }

  // All session tasks done
  if (!currentTask) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-6 gap-4">
        <PostureBadge />
        <div className="text-8xl mt-8">🎉</div>
        <h1 className="text-4xl font-bold text-center text-gray-900">
          இந்த நேரத்தின் பயிற்சிகள் முடிந்தது!
        </h1>
        <Link
          to="/amma"
          className="mt-6 px-8 py-4 bg-amber-600 text-white text-2xl rounded-xl"
        >
          அம்மா பக்கம் →
        </Link>
      </div>
    );
  }

  // Skip-reason picker
  if (flow === 'skip-reason') {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col">
        <PostureBadge />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <h1 className="text-5xl font-bold text-center text-gray-900">
            காரணம் என்ன?
          </h1>
          <div className="w-full max-w-md space-y-6">
            <button
              onClick={() => handleSkipReason('pain')}
              disabled={busy}
              className="w-full h-32 bg-red-100 border-4 border-red-400 text-red-900 text-4xl font-bold rounded-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
            >
              <span className="text-5xl">🤕</span>
              <span>வலி</span>
            </button>
            <button
              onClick={() => handleSkipReason('fatigue')}
              disabled={busy}
              className="w-full h-32 bg-blue-100 border-4 border-blue-400 text-blue-900 text-4xl font-bold rounded-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
            >
              <span className="text-5xl">🥱</span>
              <span>சோர்வு</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active timer state — show breathing animation + Done
  if (flow === 'active') {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col">
        <PostureBadge />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <HemiparesisFigure />
          <h1 className="text-5xl font-bold text-center text-gray-900 leading-tight">
            {currentTask.tamil_text}
          </h1>
          {currentTask.reps_or_time_target != null && (
            <p className="text-4xl font-semibold text-gray-700">
              {currentTask.reps_or_time_target} முறை
            </p>
          )}
          <BreathingAnimation />
        </div>
        <div className="px-4 pb-8">
          <button
            onClick={handleDone}
            disabled={busy}
            className="w-full h-40 bg-green-700 hover:bg-green-800 text-white text-5xl font-bold rounded-2xl transition-all disabled:opacity-50 active:scale-95"
          >
            முடிந்தது ✅
          </button>
        </div>
      </div>
    );
  }

  // Idle state — Start + Skip buttons
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <PostureBadge />
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <HemiparesisFigure />
        <h1 className="text-5xl font-bold text-center text-gray-900 leading-tight">
          {currentTask.tamil_text}
        </h1>
        {currentTask.reps_or_time_target != null && (
          <p className="text-4xl font-semibold text-gray-700">
            {currentTask.reps_or_time_target} முறை
          </p>
        )}
      </div>
      <div className="px-4 pb-8 space-y-4">
        <button
          onClick={handleStart}
          className="w-full h-40 bg-green-700 hover:bg-green-800 text-white text-5xl font-bold rounded-2xl transition-all active:scale-95"
        >
          தொடங்கு ▶️
        </button>
        <button
          onClick={handleSkipPress}
          className="w-full h-20 bg-gray-200 hover:bg-gray-300 text-gray-700 text-3xl font-semibold rounded-2xl transition-all active:scale-95"
        >
          தவிர்க்க
        </button>
      </div>
    </div>
  );
}

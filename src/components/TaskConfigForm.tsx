import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Task, SessionType } from '../types/database';

interface TaskConfigFormProps {
  tasks: Task[];
  onChanged: () => void;
}

const SESSION_LABELS: Record<SessionType, string> = {
  morning: 'காலை',
  afternoon: 'மதியம்',
  evening: 'மாலை'
};

const TASK_OPTIONS: Array<{ tamil_text: string; icon: string }> = [
  { tamil_text: 'கையை உயர்த்துதல்', icon: '🤲' },
  { tamil_text: 'பந்தை அழுத்துதல்', icon: '🟠' },
  { tamil_text: 'மூச்சு பயிற்சி', icon: '🫁' },
  { tamil_text: 'நடைப்பயிற்சி', icon: '🚶' },
  { tamil_text: 'தண்ணீர் குடிக்கவும்', icon: '💧' }
];

const MAX_PER_SESSION = 4;

export function TaskConfigForm({ tasks, onChanged }: TaskConfigFormProps) {
  const [openSession, setOpenSession] = useState<SessionType | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-3xl font-bold text-gray-900">பயிற்சிகளை அமைக்கவும்</h3>
      {(['morning', 'afternoon', 'evening'] as SessionType[]).map(session => (
        <SessionSection
          key={session}
          session={session}
          tasks={tasks.filter(t => t.session_type === session)}
          isOpen={openSession === session}
          onToggle={() => setOpenSession(openSession === session ? null : session)}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

interface SessionSectionProps {
  session: SessionType;
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
  onChanged: () => void;
}

function SessionSection({ session, tasks, isOpen, onToggle, onChanged }: SessionSectionProps) {
  const [selectedOption, setSelectedOption] = useState<string>(TASK_OPTIONS[0].tamil_text);
  const [target, setTarget] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isAtLimit = tasks.length >= MAX_PER_SESSION;

  const handleAdd = async () => {
    if (isAtLimit) {
      setError(`ஒரு நேரத்திற்கு ${MAX_PER_SESSION} பயிற்சிகள் மட்டுமே`);
      return;
    }
    const option = TASK_OPTIONS.find(o => o.tamil_text === selectedOption);
    if (!option) return;

    // Prevent duplicate task in the same session
    if (tasks.some(t => t.tamil_text === option.tamil_text)) {
      setError('இந்தப் பயிற்சி ஏற்கனவே சேர்க்கப்பட்டுள்ளது');
      return;
    }

    setBusy(true);
    setError(null);

    // Calculate order_index for this session (1-indexed per session)
    const nextOrder = tasks.length + 1;

    // Map session to scheduled_time
    const sessionTimeMap: Record<string, string> = {
      morning: '08:00',
      afternoon: '14:00',
      evening: '18:00'
    };

    const { error: insertErr } = await supabase.from('tasks').insert({
      tamil_text: option.tamil_text,
      icon: option.icon,
      session_type: session,
      reps_or_time_target: target,
      order_index: nextOrder,
      scheduled_time: sessionTimeMap[session] || '12:00'
    });

    if (insertErr) {
      console.error('Task insert failed:', insertErr);
      setError('பயிற்சியைச் சேர்க்க இயலவில்லை');
    } else {
      onChanged();
    }
    setBusy(false);
  };

  const handleDelete = async (taskId: string) => {
    setBusy(true);
    const { error: delErr } = await supabase.from('tasks').delete().eq('id', taskId);
    if (delErr) {
      console.error('Task delete failed:', delErr);
      setError('நீக்க இயலவில்லை');
    } else {
      onChanged();
    }
    setBusy(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-amber-50 hover:bg-amber-100"
      >
        <span className="text-2xl font-bold text-gray-900">
          {SESSION_LABELS[session]} ({tasks.length}/{MAX_PER_SESSION})
        </span>
        <span className="text-2xl">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Existing tasks list */}
          <div className="space-y-2">
            {tasks.length === 0 && (
              <p className="text-xl text-gray-500">பயிற்சிகள் இல்லை</p>
            )}
            {tasks.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.icon}</span>
                  <span className="text-xl text-gray-900">{t.tamil_text}</span>
                  {t.reps_or_time_target != null && (
                    <span className="text-lg text-gray-600">
                      ({t.reps_or_time_target})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={busy}
                  className="px-3 py-2 bg-red-100 text-red-700 text-lg rounded-lg disabled:opacity-50"
                >
                  நீக்கு
                </button>
              </div>
            ))}
          </div>

          {/* Add new */}
          {!isAtLimit && (
            <div className="border-t pt-4 space-y-3">
              <select
                value={selectedOption}
                onChange={e => setSelectedOption(e.target.value)}
                className="w-full p-3 text-xl border-2 border-gray-300 rounded-lg"
              >
                {TASK_OPTIONS.map(o => (
                  <option key={o.tamil_text} value={o.tamil_text}>
                    {o.icon} {o.tamil_text}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={60}
                value={target}
                onChange={e => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 text-xl border-2 border-gray-300 rounded-lg"
                placeholder="எண்ணிக்கை / நிமிடம்"
              />
              <button
                onClick={handleAdd}
                disabled={busy}
                className="w-full p-4 bg-green-600 text-white text-xl font-bold rounded-lg disabled:opacity-50"
              >
                + சேர்க்க
              </button>
            </div>
          )}

          {error && (
            <p className="text-lg text-red-700 font-semibold">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

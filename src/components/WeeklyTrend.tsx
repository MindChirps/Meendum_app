import type { WeeklyStats } from '../hooks/useWeeklyStats';

interface WeeklyTrendProps {
  stats: WeeklyStats;
  totalTasksPerDay: number;
}

const TAMIL_DAY_SHORT: Record<number, string> = {
  0: 'ஞா',
  1: 'தி',
  2: 'செ',
  3: 'பு',
  4: 'வி',
  5: 'வெ',
  6: 'ச',
};

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return TAMIL_DAY_SHORT[d.getDay()] || '';
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toLocaleDateString('en-CA');
}

export function WeeklyTrend({ stats, totalTasksPerDay }: WeeklyTrendProps) {
  const { days, currentStreak, bestStreak, weeklyRate, monthlyCompleted, monthlyPainSkips, monthlyFatigueSkips } = stats;

  // Motivational text based on weekly rate
  let motivationText: string;
  let motivationEmoji: string;
  if (weeklyRate >= 80) {
    motivationText = 'மிகச் சிறப்பு!';
    motivationEmoji = '🌟';
  } else if (weeklyRate >= 50) {
    motivationText = 'நன்றாக முன்னேறுகிறீர்கள்!';
    motivationEmoji = '💪';
  } else {
    motivationText = 'ஒவ்வொரு முயற்சியும் முக்கியம்';
    motivationEmoji = '❤️';
  }

  // Streak emoji
  let streakEmoji = '⭐';
  if (currentStreak >= 30) streakEmoji = '🏆';
  else if (currentStreak >= 7) streakEmoji = '🎉';
  else if (currentStreak >= 1) streakEmoji = '🔥';

  return (
    <div className="mt-6 space-y-4">
      {/* Streak Card */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{streakEmoji}</span>
          <div>
            {currentStreak > 0 ? (
              <p className="text-3xl font-bold text-gray-900">
                தொடர் பயிற்சி: {currentStreak} நாட்கள்!
              </p>
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                இன்று தொடங்குங்கள்!
              </p>
            )}
            {bestStreak > currentStreak && (
              <p className="text-xl text-gray-600">
                சிறந்த சாதனை: {bestStreak} நாட்கள்
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <h4 className="text-2xl font-bold text-gray-900">கடந்த 7 நாட்கள்</h4>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const pct = totalTasksPerDay > 0 ? day.completed / totalTasksPerDay : 0;
            const today = isToday(day.date);

            let bgClass = 'bg-gray-100';
            let indicator = '⬜';
            if (day.completed > 0 && pct >= 0.5) {
              bgClass = 'bg-green-100';
              indicator = '🟢';
            } else if (day.completed > 0) {
              bgClass = 'bg-yellow-100';
              indicator = '🟡';
            } else if (day.painSkips > 0) {
              bgClass = 'bg-red-50';
              indicator = '🤕';
            }

            return (
              <div
                key={day.date}
                className={`flex flex-col items-center justify-center p-2 rounded-xl min-h-[80px] ${bgClass} ${today ? 'ring-2 ring-blue-400' : ''}`}
              >
                <span className="text-lg font-semibold text-gray-600">
                  {getDayName(day.date)}
                </span>
                <span className="text-2xl">{indicator}</span>
                {day.completed > 0 && (
                  <span className="text-lg font-bold text-gray-800">{day.completed}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <h4 className="text-2xl font-bold text-gray-900">கடந்த 30 நாட்கள்</h4>

        <div className="space-y-2">
          <p className="text-2xl text-gray-800">
            ✅ {monthlyCompleted} பயிற்சிகள் முடிந்தது
          </p>
          {monthlyPainSkips > 0 && (
            <p className="text-2xl text-orange-700">
              🤕 {monthlyPainSkips} வலி தவிர்ப்புகள்
            </p>
          )}
          {monthlyFatigueSkips > 0 && (
            <p className="text-2xl text-blue-700">
              🥱 {monthlyFatigueSkips} சோர்வு தவிர்ப்புகள்
            </p>
          )}
        </div>

        {/* Weekly rate bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xl text-gray-600">வாரத்தின் விகிதம்</span>
            <span className="text-xl font-bold text-gray-800">{weeklyRate}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(weeklyRate, 100)}%`,
                backgroundColor: weeklyRate >= 80 ? '#16a34a' : weeklyRate >= 50 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
          <p className="text-2xl font-semibold text-center mt-2">
            {motivationEmoji} {motivationText}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Slow, soothing expanding/contracting circle to pace Appa's breathing
 * during a task. Pure CSS animation, no JS timers.
 */
export function BreathingAnimation() {
  return (
    <div className="flex items-center justify-center py-6">
      <div
        className="rounded-full bg-blue-300 opacity-70"
        style={{
          width: '120px',
          height: '120px',
          animation: 'breathing 6s ease-in-out infinite'
        }}
      />
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(0.7); opacity: 0.5; }
          50%      { transform: scale(1.15); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

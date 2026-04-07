interface SOSButtonProps {
  isResting: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Amma's SOS rest button. Tapping puts Appa's screen into passive rest mode
 * (forcing him to stop tasks until Amma resumes).
 */
export function SOSButton({ isResting, onClick, disabled = false }: SOSButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-32 ${
        isResting ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
      } text-white text-3xl font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex flex-col items-center justify-center gap-2`}
    >
      <span className="text-5xl">{isResting ? '▶️' : '🛑'}</span>
      <span>{isResting ? 'மீண்டும் தொடர' : 'நான் ஓய்வு எடுக்கிறேன்'}</span>
    </button>
  );
}

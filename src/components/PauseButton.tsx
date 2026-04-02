interface PauseButtonProps {
  isResting: boolean;
  onClick: () => void;
}

export function PauseButton({ isResting, onClick }: PauseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-32 ${
        isResting ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
      } text-white text-4xl font-bold rounded-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2`}
    >
      <span className="text-5xl">{isResting ? '▶️' : '🛑'}</span>
      <span>{isResting ? 'தொடரவும்' : 'நான் ஓய்வு எடுக்கிறேன்'}</span>
    </button>
  );
}

interface DoneButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DoneButton({ onClick, disabled = false }: DoneButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-40 bg-green-700 hover:bg-green-800 text-white text-5xl font-bold rounded-2xl mx-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
    >
      முடிந்தது ✅
    </button>
  );
}

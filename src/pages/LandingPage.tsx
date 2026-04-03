import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-center px-6 gap-8">
      <h1 className="text-5xl font-bold text-gray-900 text-center">
        மீண்டும்
      </h1>
      <p className="text-2xl text-gray-600 text-center">
        யாருக்கான பக்கம்?
      </p>

      <div className="w-full max-w-sm space-y-6">
        <Link
          to="/appa"
          className="block w-full h-36 bg-green-700 hover:bg-green-800 text-white text-4xl font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
        >
          <span className="text-5xl">👨</span>
          <span>அப்பா</span>
        </Link>

        <Link
          to="/amma"
          className="block w-full h-36 bg-amber-600 hover:bg-amber-700 text-white text-4xl font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
        >
          <span className="text-5xl">👩</span>
          <span>அம்மா</span>
        </Link>
      </div>
    </div>
  );
}

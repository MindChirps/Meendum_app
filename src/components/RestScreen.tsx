/**
 * Shown to Appa when Amma has tapped the SOS rest button.
 * Pure passive screen with no interactive elements — Appa cannot exit it himself.
 */
export function RestScreen() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-6 pointer-events-none">
      <div className="text-8xl mb-12">😴</div>
      <h1 className="text-5xl font-bold text-center text-gray-900">
        ஓய்வு எடுங்கள்
      </h1>
      <p className="text-2xl text-center text-gray-600 mt-6">
        அம்மா திரும்பும் வரை காத்திருங்கள்
      </p>
    </div>
  );
}

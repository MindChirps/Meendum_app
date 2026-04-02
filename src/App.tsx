import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabaseMissing } from './lib/supabase';
import { LandingPage } from './pages/LandingPage';
import { AppaScreen } from './pages/AppaScreen';
import { AmmaScreen } from './pages/AmmaScreen';

function MissingConfig() {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-6 gap-4">
      <div className="text-5xl">⚠️</div>
      <h1 className="text-3xl font-bold text-red-800 text-center">
        Supabase configuration missing
      </h1>
      <p className="text-xl text-red-700 text-center max-w-md">
        Create a <code className="bg-red-100 px-2 py-1 rounded">.env</code> file
        with <code className="bg-red-100 px-2 py-1 rounded">VITE_SUPABASE_URL</code> and{' '}
        <code className="bg-red-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code>.
      </p>
    </div>
  );
}

function App() {
  if (supabaseMissing) {
    return <MissingConfig />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/appa" element={<AppaScreen />} />
        <Route path="/amma" element={<AmmaScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

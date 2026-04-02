import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppaScreen } from './pages/AppaScreen';
import { AmmaScreen } from './pages/AmmaScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/appa" replace />} />
        <Route path="/appa" element={<AppaScreen />} />
        <Route path="/amma" element={<AmmaScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

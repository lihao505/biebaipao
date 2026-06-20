import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScenarioSelectPage from './pages/ScenarioSelectPage';
import BeginnerGuidePage from './pages/BeginnerGuidePage';
import MaterialListPage from './pages/MaterialListPage';
import MaterialGuidePage from './pages/MaterialGuidePage';
import ProcessFlowPage from './pages/ProcessFlowPage';
import OfficialInfoPage from './pages/OfficialInfoPage';
import OnsiteAskPage from './pages/OnsiteAskPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/scenarios" element={<ScenarioSelectPage />} />
      <Route path="/guide/:scenarioId" element={<BeginnerGuidePage />} />
      <Route path="/materials/:scenarioId" element={<MaterialListPage />} />
      <Route path="/material-guide/:scenarioId/:materialId" element={<MaterialGuidePage />} />
      <Route path="/process/:scenarioId" element={<ProcessFlowPage />} />
      <Route path="/official/:scenarioId" element={<OfficialInfoPage />} />
      <Route path="/onsite/:scenarioId" element={<OnsiteAskPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

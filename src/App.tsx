import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ScenarioSelectPage from './pages/ScenarioSelectPage';
import BeginnerGuidePage from './pages/BeginnerGuidePage';
import MaterialListPage from './pages/MaterialListPage';
import MaterialGuidePage from './pages/MaterialGuidePage';
import ProcessFlowPage from './pages/ProcessFlowPage';
import OfficialInfoPage from './pages/OfficialInfoPage';
import OnsiteAskPage from './pages/OnsiteAskPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TutorialPage from './pages/TutorialPage';
import CoachPage from './pages/CoachPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import NextStepPage from './pages/NextStepPage';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Core pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/scenarios" element={<ScenarioSelectPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/coach" element={<CoachPage />} />
      <Route path="/coach/:scenarioId" element={<CoachPage />} />

      {/* Task-based pages (new flow) */}
      <Route path="/task/:taskId" element={<TaskDetailPage />} />
      <Route path="/next-step/:taskId" element={<NextStepPage />} />
      <Route path="/tutorial/:taskId" element={<TutorialPage />} />
      <Route path="/tutorial/:taskId/:materialId" element={<TutorialPage />} />

      {/* Legacy scenario-based pages (still functional) */}
      <Route path="/guide/:scenarioId" element={<BeginnerGuidePage />} />
      <Route path="/materials/:scenarioId" element={<MaterialListPage />} />
      <Route path="/material-guide/:scenarioId/:materialId" element={<MaterialGuidePage />} />
      <Route path="/process/:scenarioId" element={<ProcessFlowPage />} />
      <Route path="/official/:scenarioId" element={<OfficialInfoPage />} />
      <Route path="/onsite/:scenarioId" element={<OnsiteAskPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

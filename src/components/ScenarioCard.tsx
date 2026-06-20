import { useNavigate } from 'react-router-dom';
import type { Scenario } from '../types';

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/guide/${scenario.id}`)}
      className="card w-full p-4 text-left transition-all active:scale-95 hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
          {scenario.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
          <p className="text-sm text-gray-500 truncate">{scenario.shortDesc}</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}

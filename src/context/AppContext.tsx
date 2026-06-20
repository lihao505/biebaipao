import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { MaterialCheckState } from '../types';

interface AppContextValue {
  selectedScenarioId: string | null;
  setSelectedScenarioId: (id: string | null) => void;
  materialChecks: MaterialCheckState;
  toggleMaterial: (materialId: string) => void;
  resetMaterialChecks: () => void;
  visitedSteps: number[];
  markStepVisited: (step: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [materialChecks, setMaterialChecks] = useState<MaterialCheckState>({});
  const [visitedSteps, setVisitedSteps] = useState<number[]>([]);

  const toggleMaterial = useCallback((materialId: string) => {
    setMaterialChecks((prev) => ({
      ...prev,
      [materialId]: !prev[materialId],
    }));
  }, []);

  const resetMaterialChecks = useCallback(() => {
    setMaterialChecks({});
  }, []);

  const markStepVisited = useCallback((step: number) => {
    setVisitedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedScenarioId,
        setSelectedScenarioId,
        materialChecks,
        toggleMaterial,
        resetMaterialChecks,
        visitedSteps,
        markStepVisited,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

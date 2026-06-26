import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { MaterialCheckState } from '../types';
import type { Task, UserSettings, ToastState } from '../types/task';
import { storage } from '../lib/storage';
import { getScenarioById } from '../data/scenarios';
import { getTaskTemplate } from '../data/taskTemplates';
import { analyzeRisk } from '../lib/riskEngine';

interface AppContextValue {
  // Legacy support (for current task)
  selectedScenarioId: string | null;
  setSelectedScenarioId: (id: string | null) => void;
  materialChecks: MaterialCheckState;
  toggleMaterial: (materialId: string) => void;
  resetMaterialChecks: () => void;

  // Task management
  tasks: Task[];
  currentTaskId: string | null;
  createTask: (scenarioId: string) => string;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  abandonTask: (taskId: string) => void;
  reopenTask: (taskId: string) => void;
  setCurrentTaskId: (id: string | null) => void;
  getCurrentTask: () => Task | null;
  updateTaskMaterialChecks: (taskId: string, checks: MaterialCheckState) => void;
  toggleTaskMaterial: (taskId: string, materialId: string) => void;
  toggleStepComplete: (taskId: string, step: number) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;

  // Toast
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [materialChecks, setMaterialChecks] = useState<MaterialCheckState>({});

  // Persist tasks and settings
  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // ===== Toast =====
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const recentToastMessages = useRef<{ message: string; ts: number }[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
      // Dedup: skip if same message was shown within last 2 seconds
      const now = Date.now();
      const isDuplicate = recentToastMessages.current.some(
        (entry) => entry.message === message && now - entry.ts < 2000
      );
      if (isDuplicate) return;

      // Track this message
      recentToastMessages.current.push({ message, ts: now });
      // Clean old entries
      recentToastMessages.current = recentToastMessages.current.filter(
        (entry) => now - entry.ts < 5000
      );

      const id = `${now}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      toastTimers.current[id] = setTimeout(() => {
        dismissToast(id);
      }, 2500);
    },
    [dismissToast]
  );

  // ===== Task management =====
  const createTask = useCallback((scenarioId: string): string => {
    const scenario = getScenarioById(scenarioId);
    const template = getTaskTemplate(scenarioId);
    if (!scenario || !template) return '';

    const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();

    const newTask: Task = {
      id: taskId,
      scenarioId,
      scenarioName: scenario.name,
      scenarioIcon: scenario.icon,
      title: template.title,
      location: template.location,
      estimatedTime: template.estimatedTime,
      createdAt: now,
      updatedAt: now,
      status: 'preparing',
      materialChecks: {},
      completedSteps: [],
      completeness: 0,
      riskLevel: 'high',
    };

    setTasks((prev) => [newTask, ...prev]);
    setCurrentTaskId(taskId);
    setSelectedScenarioId(scenarioId);
    setMaterialChecks({});
    return taskId;
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (currentTaskId === taskId) {
      setCurrentTaskId(null);
    }
  }, [currentTaskId]);

  const completeTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'completed' as const, updatedAt: Date.now() }
          : t
      )
    );
  }, []);

  const abandonTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'abandoned' as const, updatedAt: Date.now() }
          : t
      )
    );
  }, []);

  const reopenTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'preparing' as const, updatedAt: Date.now() }
          : t
      )
    );
    setCurrentTaskId(taskId);
  }, []);

  const getCurrentTask = useCallback((): Task | null => {
    if (!currentTaskId) return null;
    return tasks.find((t) => t.id === currentTaskId) ?? null;
  }, [currentTaskId, tasks]);

  const updateTaskMaterialChecks = useCallback(
    (taskId: string, checks: MaterialCheckState) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const scenario = getScenarioById(t.scenarioId);
          if (!scenario) return t;
          const analysis = analyzeRisk(scenario, checks, new Date(), settings);
          return {
            ...t,
            materialChecks: checks,
            completeness: analysis.completeness,
            riskLevel: analysis.riskLevel,
            updatedAt: Date.now(),
          };
        })
      );
    },
    [settings]
  );

  const toggleTaskMaterial = useCallback(
    (taskId: string, materialId: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const newChecks = { ...t.materialChecks, [materialId]: !t.materialChecks[materialId] };
          const scenario = getScenarioById(t.scenarioId);
          if (!scenario) return t;
          const analysis = analyzeRisk(scenario, newChecks, new Date(), settings);
          return {
            ...t,
            materialChecks: newChecks,
            completeness: analysis.completeness,
            riskLevel: analysis.riskLevel,
            updatedAt: Date.now(),
          };
        })
      );
    },
    [settings]
  );

  const toggleStepComplete = useCallback((taskId: string, step: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const completed = t.completedSteps.includes(step)
          ? t.completedSteps.filter((s) => s !== step)
          : [...t.completedSteps, step];
        return { ...t, completedSteps: completed, updatedAt: Date.now() };
      })
    );
  }, []);

  // ===== Settings =====
  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  // ===== Legacy material checks =====
  const resetMaterialChecks = useCallback(() => {
    setMaterialChecks({});
  }, []);

  // Sync legacy materialChecks with current task
  useEffect(() => {
    if (currentTaskId) {
      const task = tasks.find((t) => t.id === currentTaskId);
      if (task) {
        setMaterialChecks(task.materialChecks);
      }
    }
  }, [currentTaskId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync legacy materialChecks changes back to task
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateLegacyChecks = useCallback(
    (checks: MaterialCheckState) => {
      if (!currentTaskId) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        updateTaskMaterialChecks(currentTaskId, checks);
      }, 300);
    },
    [currentTaskId, updateTaskMaterialChecks]
  );

  const toggleMaterialWithSync = useCallback(
    (materialId: string) => {
      setMaterialChecks((prev) => {
        const newChecks = { ...prev, [materialId]: !prev[materialId] };
        updateLegacyChecks(newChecks);
        return newChecks;
      });
    },
    [updateLegacyChecks]
  );

  return (
    <AppContext.Provider
      value={{
        selectedScenarioId,
        setSelectedScenarioId,
        materialChecks,
        toggleMaterial: toggleMaterialWithSync,
        resetMaterialChecks,
        tasks,
        currentTaskId,
        createTask,
        deleteTask,
        completeTask,
        abandonTask,
        reopenTask,
        setCurrentTaskId,
        getCurrentTask,
        updateTaskMaterialChecks,
        toggleTaskMaterial,
        toggleStepComplete,
        settings,
        updateSettings,
        toasts,
        showToast,
        dismissToast,
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

// ===== localStorage persistence layer =====

const PREFIX = 'biebaipao:';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // noop
  }
}

// ===== Task storage =====

import type { Task, UserSettings } from '../types/task';

export const storage = {
  getTasks: (): Task[] => safeGet<Task[]>('tasks', []),
  saveTasks: (tasks: Task[]): void => safeSet('tasks', tasks),

  getSettings: (): UserSettings =>
    safeGet<UserSettings>('settings', {
      defaultCity: '杭州',
      preferredScenarios: [],
      highRiskAlert: true,
      showDetailedTutorial: true,
    }),
  saveSettings: (settings: UserSettings): void => safeSet('settings', settings),

  clearAll: (): void => {
    safeRemove('tasks');
    safeRemove('settings');
  },
};

// AsyncStorage service for persistent data

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Goal, Session, AppSettings } from '../types';

const STORAGE_KEYS = {
  CLIENTS: '@speech_therapy_clients',
  GOALS: '@speech_therapy_goals',
  SESSIONS: '@speech_therapy_sessions',
  SETTINGS: '@speech_therapy_settings',
};

// Default app settings
const DEFAULT_SETTINGS: AppSettings = {
  defaultSessionDuration: 30,
  defaultTargetAccuracy: 80,
  enableNotifications: true,
  theme: 'system',
  cueLevels: ['independent', 'verbal_cue', 'visual_cue', 'model', 'partial_physical', 'full_physical'],
  responseOptions: ['correct', 'incorrect', 'approximation', 'no_response'],
};

// Generic storage functions
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
}

// Client operations
export const ClientStorage = {
  async getAll(): Promise<Client[]> {
    const clients = await getItem<Client[]>(STORAGE_KEYS.CLIENTS);
    return clients || [];
  },

  async getById(id: string): Promise<Client | null> {
    const clients = await this.getAll();
    return clients.find((c) => c.id === id) || null;
  },

  async save(client: Client): Promise<boolean> {
    const clients = await this.getAll();
    const existingIndex = clients.findIndex((c) => c.id === client.id);

    if (existingIndex >= 0) {
      clients[existingIndex] = { ...client, updatedAt: new Date().toISOString() };
    } else {
      clients.push(client);
    }

    return setItem(STORAGE_KEYS.CLIENTS, clients);
  },

  async delete(id: string): Promise<boolean> {
    const clients = await this.getAll();
    const filtered = clients.filter((c) => c.id !== id);

    // Also delete related goals and sessions
    await GoalStorage.deleteByClientId(id);
    await SessionStorage.deleteByClientId(id);

    return setItem(STORAGE_KEYS.CLIENTS, filtered);
  },

  async getActive(): Promise<Client[]> {
    const clients = await this.getAll();
    return clients.filter((c) => c.isActive);
  },
};

// Goal operations
export const GoalStorage = {
  async getAll(): Promise<Goal[]> {
    const goals = await getItem<Goal[]>(STORAGE_KEYS.GOALS);
    return goals || [];
  },

  async getById(id: string): Promise<Goal | null> {
    const goals = await this.getAll();
    return goals.find((g) => g.id === id) || null;
  },

  async getByClientId(clientId: string): Promise<Goal[]> {
    const goals = await this.getAll();
    return goals.filter((g) => g.clientId === clientId);
  },

  async getActiveByClientId(clientId: string): Promise<Goal[]> {
    const goals = await this.getByClientId(clientId);
    return goals.filter((g) => g.status === 'active');
  },

  async save(goal: Goal): Promise<boolean> {
    const goals = await this.getAll();
    const existingIndex = goals.findIndex((g) => g.id === goal.id);

    if (existingIndex >= 0) {
      goals[existingIndex] = { ...goal, updatedAt: new Date().toISOString() };
    } else {
      goals.push(goal);
    }

    return setItem(STORAGE_KEYS.GOALS, goals);
  },

  async delete(id: string): Promise<boolean> {
    const goals = await this.getAll();
    const filtered = goals.filter((g) => g.id !== id);
    return setItem(STORAGE_KEYS.GOALS, filtered);
  },

  async deleteByClientId(clientId: string): Promise<boolean> {
    const goals = await this.getAll();
    const filtered = goals.filter((g) => g.clientId !== clientId);
    return setItem(STORAGE_KEYS.GOALS, filtered);
  },

  async updateAccuracy(id: string, accuracy: number): Promise<boolean> {
    const goal = await this.getById(id);
    if (!goal) return false;

    goal.currentAccuracy = accuracy;
    if (accuracy >= goal.targetAccuracy) {
      goal.status = 'achieved';
    }

    return this.save(goal);
  },
};

// Session operations
export const SessionStorage = {
  async getAll(): Promise<Session[]> {
    const sessions = await getItem<Session[]>(STORAGE_KEYS.SESSIONS);
    return sessions || [];
  },

  async getById(id: string): Promise<Session | null> {
    const sessions = await this.getAll();
    return sessions.find((s) => s.id === id) || null;
  },

  async getByClientId(clientId: string): Promise<Session[]> {
    const sessions = await this.getAll();
    return sessions
      .filter((s) => s.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getByGoalId(goalId: string): Promise<Session[]> {
    const sessions = await this.getAll();
    return sessions
      .filter((s) => s.goals.includes(goalId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getRecent(limit: number = 10): Promise<Session[]> {
    const sessions = await this.getAll();
    return sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },

  async save(session: Session): Promise<boolean> {
    const sessions = await this.getAll();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    return setItem(STORAGE_KEYS.SESSIONS, sessions);
  },

  async delete(id: string): Promise<boolean> {
    const sessions = await this.getAll();
    const filtered = sessions.filter((s) => s.id !== id);
    return setItem(STORAGE_KEYS.SESSIONS, filtered);
  },

  async deleteByClientId(clientId: string): Promise<boolean> {
    const sessions = await this.getAll();
    const filtered = sessions.filter((s) => s.clientId !== clientId);
    return setItem(STORAGE_KEYS.SESSIONS, filtered);
  },
};

// Settings operations
export const SettingsStorage = {
  async get(): Promise<AppSettings> {
    const settings = await getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
    return settings || DEFAULT_SETTINGS;
  },

  async save(settings: AppSettings): Promise<boolean> {
    return setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  async reset(): Promise<boolean> {
    return setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
};

// Export all data (for backup)
export const exportAllData = async (): Promise<string> => {
  const clients = await ClientStorage.getAll();
  const goals = await GoalStorage.getAll();
  const sessions = await SessionStorage.getAll();
  const settings = await SettingsStorage.get();

  const data = {
    exportDate: new Date().toISOString(),
    clients,
    goals,
    sessions,
    settings,
  };

  return JSON.stringify(data, null, 2);
};

// Import data (from backup)
export const importData = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString);

    if (data.clients) {
      await setItem(STORAGE_KEYS.CLIENTS, data.clients);
    }
    if (data.goals) {
      await setItem(STORAGE_KEYS.GOALS, data.goals);
    }
    if (data.sessions) {
      await setItem(STORAGE_KEYS.SESSIONS, data.sessions);
    }
    if (data.settings) {
      await setItem(STORAGE_KEYS.SETTINGS, data.settings);
    }

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

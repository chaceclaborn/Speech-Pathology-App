// App Context for global state management

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Client, Goal, Session, AppSettings } from '../types';
import {
  ClientStorage,
  GoalStorage,
  SessionStorage,
  SettingsStorage,
} from '../services/storage';

interface AppContextType {
  // Data
  clients: Client[];
  goals: Goal[];
  sessions: Session[];
  settings: AppSettings;

  // Loading states
  isLoading: boolean;

  // Client operations
  addClient: (client: Client) => Promise<boolean>;
  updateClient: (client: Client) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  getClient: (id: string) => Client | undefined;

  // Goal operations
  addGoal: (goal: Goal) => Promise<boolean>;
  updateGoal: (goal: Goal) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  getGoal: (id: string) => Goal | undefined;
  getGoalsByClient: (clientId: string) => Goal[];
  getActiveGoalsByClient: (clientId: string) => Goal[];

  // Session operations
  addSession: (session: Session) => Promise<boolean>;
  updateSession: (session: Session) => Promise<boolean>;
  deleteSession: (id: string) => Promise<boolean>;
  getSession: (id: string) => Session | undefined;
  getSessionsByClient: (clientId: string) => Session[];
  getSessionsByGoal: (goalId: string) => Session[];

  // Settings operations
  updateSettings: (settings: AppSettings) => Promise<boolean>;

  // Refresh data
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    defaultSessionDuration: 30,
    defaultTargetAccuracy: 80,
    enableNotifications: true,
    theme: 'system',
    cueLevels: ['independent', 'verbal_cue', 'visual_cue', 'model', 'partial_physical', 'full_physical'],
    responseOptions: ['correct', 'incorrect', 'approximation', 'no_response'],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedClients, loadedGoals, loadedSessions, loadedSettings] = await Promise.all([
        ClientStorage.getAll(),
        GoalStorage.getAll(),
        SessionStorage.getAll(),
        SettingsStorage.get(),
      ]);

      setClients(loadedClients);
      setGoals(loadedGoals);
      setSessions(loadedSessions);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client operations
  const addClient = async (client: Client): Promise<boolean> => {
    const success = await ClientStorage.save(client);
    if (success) {
      setClients((prev) => [...prev, client]);
    }
    return success;
  };

  const updateClient = async (client: Client): Promise<boolean> => {
    const success = await ClientStorage.save(client);
    if (success) {
      setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    }
    return success;
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    const success = await ClientStorage.delete(id);
    if (success) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      setGoals((prev) => prev.filter((g) => g.clientId !== id));
      setSessions((prev) => prev.filter((s) => s.clientId !== id));
    }
    return success;
  };

  const getClient = (id: string): Client | undefined => {
    return clients.find((c) => c.id === id);
  };

  // Goal operations
  const addGoal = async (goal: Goal): Promise<boolean> => {
    const success = await GoalStorage.save(goal);
    if (success) {
      setGoals((prev) => [...prev, goal]);
    }
    return success;
  };

  const updateGoal = async (goal: Goal): Promise<boolean> => {
    const success = await GoalStorage.save(goal);
    if (success) {
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
    }
    return success;
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    const success = await GoalStorage.delete(id);
    if (success) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
    return success;
  };

  const getGoal = (id: string): Goal | undefined => {
    return goals.find((g) => g.id === id);
  };

  const getGoalsByClient = (clientId: string): Goal[] => {
    return goals.filter((g) => g.clientId === clientId);
  };

  const getActiveGoalsByClient = (clientId: string): Goal[] => {
    return goals.filter((g) => g.clientId === clientId && g.status === 'active');
  };

  // Session operations
  const addSession = async (session: Session): Promise<boolean> => {
    const success = await SessionStorage.save(session);
    if (success) {
      setSessions((prev) => [...prev, session]);
    }
    return success;
  };

  const updateSession = async (session: Session): Promise<boolean> => {
    const success = await SessionStorage.save(session);
    if (success) {
      setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
    }
    return success;
  };

  const deleteSession = async (id: string): Promise<boolean> => {
    const success = await SessionStorage.delete(id);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
    return success;
  };

  const getSession = (id: string): Session | undefined => {
    return sessions.find((s) => s.id === id);
  };

  const getSessionsByClient = (clientId: string): Session[] => {
    return sessions
      .filter((s) => s.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getSessionsByGoal = (goalId: string): Session[] => {
    return sessions
      .filter((s) => s.goals.includes(goalId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Settings operations
  const updateSettings = async (newSettings: AppSettings): Promise<boolean> => {
    const success = await SettingsStorage.save(newSettings);
    if (success) {
      setSettings(newSettings);
    }
    return success;
  };

  // Refresh data
  const refreshData = async (): Promise<void> => {
    await loadData();
  };

  const value: AppContextType = {
    clients,
    goals,
    sessions,
    settings,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    getGoalsByClient,
    getActiveGoalsByClient,
    addSession,
    updateSession,
    deleteSession,
    getSession,
    getSessionsByClient,
    getSessionsByGoal,
    updateSettings,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

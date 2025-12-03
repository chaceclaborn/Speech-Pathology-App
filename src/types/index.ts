// Core Types for Speech Therapy App

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Goal {
  id: string;
  clientId: string;
  name: string;
  description: string;
  targetAccuracy: number; // percentage (0-100)
  currentAccuracy: number;
  targetDate?: string;
  status: 'active' | 'achieved' | 'discontinued';
  category: GoalCategory;
  createdAt: string;
  updatedAt: string;
}

export type GoalCategory =
  | 'articulation'
  | 'language'
  | 'fluency'
  | 'voice'
  | 'pragmatics'
  | 'phonology'
  | 'other';

export interface Session {
  id: string;
  clientId: string;
  date: string;
  duration: number; // in minutes
  notes?: string;
  goals: string[]; // goal IDs worked on
  trials: Trial[];
  createdAt: string;
}

export interface Trial {
  id: string;
  sessionId: string;
  goalId: string;
  prompt: string;
  response: 'correct' | 'incorrect' | 'approximation' | 'no_response';
  cueLevel: CueLevel;
  notes?: string;
  timestamp: string;
}

export type CueLevel =
  | 'independent'
  | 'verbal_cue'
  | 'visual_cue'
  | 'model'
  | 'partial_physical'
  | 'full_physical';

export interface SessionStats {
  totalTrials: number;
  correctTrials: number;
  incorrectTrials: number;
  approximationTrials: number;
  noResponseTrials: number;
  accuracy: number;
}

export interface GoalProgress {
  goalId: string;
  goalName: string;
  sessions: {
    date: string;
    accuracy: number;
    trialCount: number;
  }[];
  overallAccuracy: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface AppSettings {
  defaultSessionDuration: number;
  defaultTargetAccuracy: number;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  cueLevels: CueLevel[];
  responseOptions: Trial['response'][];
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  ClientDetail: { clientId: string };
  AddClient: undefined;
  EditClient: { clientId: string };
  GoalDetail: { goalId: string; clientId: string };
  AddGoal: { clientId: string };
  EditGoal: { goalId: string; clientId: string };
  SessionDetail: { sessionId: string; clientId: string };
  NewSession: { clientId: string; goalIds?: string[] };
  Reports: { clientId: string };
  Settings: undefined;
};

export type MainTabsParamList = {
  Clients: undefined;
  Schedule: undefined;
  Reports: undefined;
  Settings: undefined;
};

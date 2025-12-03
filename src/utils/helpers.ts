// Utility helper functions

import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Trial, SessionStats, CueLevel, GoalCategory } from '../types';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  return format(date, 'MMM d, yyyy');
};

// Format date for session headers
export const formatSessionDate = (dateString: string): string => {
  return format(parseISO(dateString), 'MMMM d, yyyy');
};

// Format time
export const formatTime = (dateString: string): string => {
  return format(parseISO(dateString), 'h:mm a');
};

// Calculate session statistics
export const calculateSessionStats = (trials: Trial[]): SessionStats => {
  const totalTrials = trials.length;
  const correctTrials = trials.filter((t) => t.response === 'correct').length;
  const incorrectTrials = trials.filter((t) => t.response === 'incorrect').length;
  const approximationTrials = trials.filter((t) => t.response === 'approximation').length;
  const noResponseTrials = trials.filter((t) => t.response === 'no_response').length;

  const accuracy = totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

  return {
    totalTrials,
    correctTrials,
    incorrectTrials,
    approximationTrials,
    noResponseTrials,
    accuracy,
  };
};

// Get accuracy color based on percentage
export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 80) return '#27AE60'; // green
  if (accuracy >= 60) return '#F39C12'; // yellow/orange
  return '#E74C3C'; // red
};

// Format duration in minutes to readable string
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

// Get readable cue level name
export const getCueLevelLabel = (level: CueLevel): string => {
  const labels: Record<CueLevel, string> = {
    independent: 'Independent',
    verbal_cue: 'Verbal Cue',
    visual_cue: 'Visual Cue',
    model: 'Model',
    partial_physical: 'Partial Physical',
    full_physical: 'Full Physical',
  };
  return labels[level];
};

// Get readable goal category name
export const getGoalCategoryLabel = (category: GoalCategory): string => {
  const labels: Record<GoalCategory, string> = {
    articulation: 'Articulation',
    language: 'Language',
    fluency: 'Fluency',
    voice: 'Voice',
    pragmatics: 'Pragmatics',
    phonology: 'Phonology',
    other: 'Other',
  };
  return labels[category];
};

// Get response label
export const getResponseLabel = (response: Trial['response']): string => {
  const labels: Record<Trial['response'], string> = {
    correct: 'Correct',
    incorrect: 'Incorrect',
    approximation: 'Approximation',
    no_response: 'No Response',
  };
  return labels[response];
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = parseISO(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Get initials from name
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, ProgressBar } from '../components';
import { Colors, GoalCategoryColors, CueLevelColors } from '../utils/colors';
import { RootStackParamList, Trial, CueLevel, Session, Goal } from '../types';
import {
  generateId,
  getCueLevelLabel,
  getGoalCategoryLabel,
  calculateSessionStats,
  getResponseLabel,
} from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'NewSession'>;

const CUE_LEVELS: CueLevel[] = [
  'independent',
  'verbal_cue',
  'visual_cue',
  'model',
  'partial_physical',
  'full_physical',
];

const RESPONSE_OPTIONS: Trial['response'][] = [
  'correct',
  'incorrect',
  'approximation',
  'no_response',
];

const RESPONSE_COLORS: Record<Trial['response'], string> = {
  correct: Colors.success,
  incorrect: Colors.error,
  approximation: Colors.warning,
  no_response: Colors.textSecondary,
};

export const NewSessionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { clientId, goalIds: initialGoalIds } = route.params;

  const { getClient, getActiveGoalsByClient, addSession, updateGoal, getGoal } = useApp();

  const client = getClient(clientId);
  const activeGoals = getActiveGoalsByClient(clientId);

  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(
    initialGoalIds || []
  );
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentCueLevel, setCurrentCueLevel] = useState<CueLevel>('independent');
  const [prompt, setPrompt] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentGoal = useMemo(() => {
    if (selectedGoalIds.length === 0) return null;
    return getGoal(selectedGoalIds[currentGoalIndex]);
  }, [selectedGoalIds, currentGoalIndex, getGoal]);

  const currentGoalTrials = useMemo(() => {
    if (!currentGoal) return [];
    return trials.filter((t) => t.goalId === currentGoal.id);
  }, [trials, currentGoal]);

  const currentGoalStats = useMemo(() => {
    return calculateSessionStats(currentGoalTrials);
  }, [currentGoalTrials]);

  const overallStats = useMemo(() => {
    return calculateSessionStats(trials);
  }, [trials]);

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleStartSession = () => {
    if (selectedGoalIds.length === 0) {
      Alert.alert('Select Goals', 'Please select at least one goal to work on.');
      return;
    }
    setSessionStarted(true);
  };

  const handleRecordTrial = (response: Trial['response']) => {
    if (!currentGoal) return;

    const newTrial: Trial = {
      id: generateId(),
      sessionId: '', // Will be set when session is saved
      goalId: currentGoal.id,
      prompt: prompt.trim() || `Trial ${currentGoalTrials.length + 1}`,
      response,
      cueLevel: currentCueLevel,
      timestamp: new Date().toISOString(),
    };

    setTrials((prev) => [...prev, newTrial]);
    setPrompt('');
  };

  const handleDeleteLastTrial = () => {
    if (currentGoalTrials.length === 0) return;

    const lastTrial = currentGoalTrials[currentGoalTrials.length - 1];
    setTrials((prev) => prev.filter((t) => t.id !== lastTrial.id));
  };

  const handleNextGoal = () => {
    if (currentGoalIndex < selectedGoalIds.length - 1) {
      setCurrentGoalIndex(currentGoalIndex + 1);
    }
  };

  const handlePrevGoal = () => {
    if (currentGoalIndex > 0) {
      setCurrentGoalIndex(currentGoalIndex - 1);
    }
  };

  const calculateAndUpdateGoalAccuracy = useCallback(
    async (goalId: string) => {
      const goal = getGoal(goalId);
      if (!goal) return;

      const goalTrials = trials.filter((t) => t.goalId === goalId);
      const stats = calculateSessionStats(goalTrials);

      // Update goal's current accuracy (simple average with existing)
      const newAccuracy = Math.round(
        (goal.currentAccuracy + stats.accuracy) / 2
      );

      await updateGoal({
        ...goal,
        currentAccuracy: newAccuracy,
        status: newAccuracy >= goal.targetAccuracy ? 'achieved' : goal.status,
        updatedAt: new Date().toISOString(),
      });
    },
    [getGoal, trials, updateGoal]
  );

  const handleEndSession = async () => {
    if (trials.length === 0) {
      Alert.alert(
        'No Trials',
        'You haven\'t recorded any trials. Discard this session?',
        [
          { text: 'Continue Session', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
      return;
    }

    setIsSaving(true);

    const sessionId = generateId();
    const sessionTrials = trials.map((t) => ({ ...t, sessionId }));

    const session: Session = {
      id: sessionId,
      clientId,
      date: new Date().toISOString(),
      duration: 30, // Default duration, could be calculated
      notes: sessionNotes.trim() || undefined,
      goals: selectedGoalIds,
      trials: sessionTrials,
      createdAt: new Date().toISOString(),
    };

    const success = await addSession(session);

    if (success) {
      // Update goal accuracies
      for (const goalId of selectedGoalIds) {
        await calculateAndUpdateGoalAccuracy(goalId);
      }
      navigation.goBack();
    } else {
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  if (!client) {
    return (
      <View style={styles.container}>
        <Text>Client not found</Text>
      </View>
    );
  }

  // Goal Selection Screen
  if (!sessionStarted) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Select Goals for Session</Text>
          <Text style={styles.subtitle}>
            Choose which goals to work on with {client.firstName}
          </Text>

          {activeGoals.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active goals for this client.</Text>
              <Button
                title="Add Goal First"
                variant="outline"
                onPress={() => navigation.replace('AddGoal', { clientId })}
              />
            </Card>
          ) : (
            activeGoals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalSelectItem,
                  selectedGoalIds.includes(goal.id) && styles.goalSelectItemSelected,
                ]}
                onPress={() => toggleGoalSelection(goal.id)}
              >
                <View style={styles.goalSelectRow}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedGoalIds.includes(goal.id) && styles.checkboxSelected,
                    ]}
                  >
                    {selectedGoalIds.includes(goal.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={styles.goalSelectInfo}>
                    <View style={styles.goalSelectHeader}>
                      <Badge
                        label={getGoalCategoryLabel(goal.category)}
                        variant="category"
                        category={goal.category}
                        size="small"
                      />
                    </View>
                    <Text style={styles.goalSelectName}>{goal.name}</Text>
                    <ProgressBar
                      progress={goal.currentAccuracy}
                      showLabel
                      labelPosition="right"
                      style={styles.goalSelectProgress}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.footerButton}
          />
          <Button
            title={`Start Session (${selectedGoalIds.length})`}
            onPress={handleStartSession}
            disabled={selectedGoalIds.length === 0}
            style={styles.footerButton}
          />
        </View>
      </View>
    );
  }

  // Active Session Screen
  return (
    <View style={styles.container}>
      {/* Goal Navigation */}
      {selectedGoalIds.length > 1 && (
        <View style={styles.goalNav}>
          <TouchableOpacity
            style={[styles.navButton, currentGoalIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevGoal}
            disabled={currentGoalIndex === 0}
          >
            <Text style={styles.navButtonText}>‹ Prev</Text>
          </TouchableOpacity>
          <Text style={styles.goalNavText}>
            Goal {currentGoalIndex + 1} of {selectedGoalIds.length}
          </Text>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentGoalIndex === selectedGoalIds.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNextGoal}
            disabled={currentGoalIndex === selectedGoalIds.length - 1}
          >
            <Text style={styles.navButtonText}>Next ›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Goal Header */}
      {currentGoal && (
        <View style={styles.currentGoalHeader}>
          <View style={styles.goalHeaderRow}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: GoalCategoryColors[currentGoal.category] },
              ]}
            />
            <Text style={styles.currentGoalName} numberOfLines={2}>
              {currentGoal.name}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              Trials: {currentGoalStats.totalTrials}
            </Text>
            <Text style={styles.statText}>
              Accuracy: {currentGoalStats.accuracy}%
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.sessionContent}>
        {/* Prompt Input */}
        <View style={styles.promptSection}>
          <Text style={styles.sectionLabel}>Prompt / Target (optional)</Text>
          <TextInput
            style={styles.promptInput}
            placeholder="e.g., 'Say sun'"
            value={prompt}
            onChangeText={setPrompt}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Cue Level Selection */}
        <View style={styles.cueSection}>
          <Text style={styles.sectionLabel}>Cue Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cueRow}>
              {CUE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.cueButton,
                    currentCueLevel === level && {
                      backgroundColor: CueLevelColors[level] + '20',
                      borderColor: CueLevelColors[level],
                    },
                  ]}
                  onPress={() => setCurrentCueLevel(level)}
                >
                  <View
                    style={[
                      styles.cueDot,
                      { backgroundColor: CueLevelColors[level] },
                    ]}
                  />
                  <Text
                    style={[
                      styles.cueText,
                      currentCueLevel === level && { color: CueLevelColors[level] },
                    ]}
                  >
                    {getCueLevelLabel(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Response Buttons */}
        <View style={styles.responseSection}>
          <Text style={styles.sectionLabel}>Record Response</Text>
          <View style={styles.responseGrid}>
            {RESPONSE_OPTIONS.map((response) => (
              <TouchableOpacity
                key={response}
                style={[
                  styles.responseButton,
                  { borderColor: RESPONSE_COLORS[response] },
                ]}
                onPress={() => handleRecordTrial(response)}
              >
                <View
                  style={[
                    styles.responseDot,
                    { backgroundColor: RESPONSE_COLORS[response] },
                  ]}
                />
                <Text style={[styles.responseText, { color: RESPONSE_COLORS[response] }]}>
                  {getResponseLabel(response)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Trials */}
        {currentGoalTrials.length > 0 && (
          <View style={styles.trialsSection}>
            <View style={styles.trialsSectionHeader}>
              <Text style={styles.sectionLabel}>Recent Trials</Text>
              <TouchableOpacity onPress={handleDeleteLastTrial}>
                <Text style={styles.undoText}>Undo Last</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.trialsList}>
              {currentGoalTrials.slice(-5).reverse().map((trial, index) => (
                <View key={trial.id} style={styles.trialItem}>
                  <View
                    style={[
                      styles.trialDot,
                      { backgroundColor: RESPONSE_COLORS[trial.response] },
                    ]}
                  />
                  <Text style={styles.trialPrompt} numberOfLines={1}>
                    {trial.prompt}
                  </Text>
                  <Text
                    style={[styles.trialResponse, { color: RESPONSE_COLORS[trial.response] }]}
                  >
                    {getResponseLabel(trial.response)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Session Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionLabel}>Session Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about this session..."
            value={sessionNotes}
            onChangeText={setSessionNotes}
            multiline
            numberOfLines={3}
            placeholderTextColor={Colors.textLight}
          />
        </View>
      </ScrollView>

      {/* Session Footer */}
      <View style={styles.sessionFooter}>
        <View style={styles.sessionStats}>
          <Text style={styles.sessionStatText}>
            Total: {overallStats.totalTrials} trials
          </Text>
          <Text style={styles.sessionStatText}>
            Overall: {overallStats.accuracy}%
          </Text>
        </View>
        <Button
          title="End Session"
          onPress={handleEndSession}
          loading={isSaving}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    padding: 16,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emptyCard: {
    margin: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  goalSelectItem: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalSelectItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  goalSelectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  goalSelectInfo: {
    flex: 1,
  },
  goalSelectHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  goalSelectName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  goalSelectProgress: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  footerButton: {
    flex: 1,
  },
  goalNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  goalNavText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  currentGoalHeader: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  currentGoalName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sessionContent: {
    padding: 16,
  },
  promptSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  cueSection: {
    marginBottom: 20,
  },
  cueRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  cueText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  responseSection: {
    marginBottom: 20,
  },
  responseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  responseButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: Colors.surface,
  },
  responseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  responseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  trialsSection: {
    marginBottom: 20,
  },
  trialsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  undoText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  trialsList: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 8,
  },
  trialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  trialPrompt: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  trialResponse: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sessionStats: {
    flex: 1,
  },
  sessionStatText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

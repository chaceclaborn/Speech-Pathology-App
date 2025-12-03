import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, EmptyState } from '../components';
import { Colors, GoalCategoryColors } from '../utils/colors';
import { RootStackParamList, Trial } from '../types';
import {
  formatSessionDate,
  formatTime,
  formatDuration,
  calculateSessionStats,
  getCueLevelLabel,
  getResponseLabel,
  getGoalCategoryLabel,
} from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'SessionDetail'>;

const RESPONSE_COLORS: Record<Trial['response'], string> = {
  correct: Colors.success,
  incorrect: Colors.error,
  approximation: Colors.warning,
  no_response: Colors.textSecondary,
};

export const SessionDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { sessionId } = route.params;

  const { getSession, getGoal, deleteSession } = useApp();

  const session = getSession(sessionId);

  const overallStats = useMemo(() => {
    if (!session) return null;
    return calculateSessionStats(session.trials);
  }, [session]);

  const trialsByGoal = useMemo(() => {
    if (!session) return {};
    return session.trials.reduce<Record<string, Trial[]>>((acc, trial) => {
      if (!acc[trial.goalId]) {
        acc[trial.goalId] = [];
      }
      acc[trial.goalId].push(trial);
      return acc;
    }, {});
  }, [session]);

  if (!session || !overallStats) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Session Not Found"
          message="This session may have been deleted."
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(sessionId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Session Header */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatSessionDate(session.date)}</Text>
        <Text style={styles.time}>{formatTime(session.date)}</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{overallStats.totalTrials}</Text>
            <Text style={styles.headerStatLabel}>Trials</Text>
          </View>
          <View style={styles.headerStat}>
            <Text
              style={[
                styles.headerStatValue,
                {
                  color:
                    overallStats.accuracy >= 80
                      ? Colors.success
                      : overallStats.accuracy >= 60
                      ? Colors.warning
                      : Colors.error,
                },
              ]}
            >
              {overallStats.accuracy}%
            </Text>
            <Text style={styles.headerStatLabel}>Accuracy</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{formatDuration(session.duration)}</Text>
            <Text style={styles.headerStatLabel}>Duration</Text>
          </View>
        </View>
      </View>

      {/* Response Breakdown */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Response Breakdown</Text>
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.breakdownLabel}>Correct</Text>
            <Text style={styles.breakdownValue}>{overallStats.correctTrials}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.breakdownLabel}>Incorrect</Text>
            <Text style={styles.breakdownValue}>{overallStats.incorrectTrials}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.breakdownLabel}>Approximation</Text>
            <Text style={styles.breakdownValue}>{overallStats.approximationTrials}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownDot, { backgroundColor: Colors.textSecondary }]} />
            <Text style={styles.breakdownLabel}>No Response</Text>
            <Text style={styles.breakdownValue}>{overallStats.noResponseTrials}</Text>
          </View>
        </View>
      </Card>

      {/* Trials by Goal */}
      {Object.entries(trialsByGoal).map(([goalId, trials]) => {
        const goal = getGoal(goalId);
        const goalStats = calculateSessionStats(trials);

        return (
          <Card key={goalId} style={styles.section}>
            <View style={styles.goalHeader}>
              {goal && (
                <>
                  <View
                    style={[
                      styles.goalDot,
                      { backgroundColor: GoalCategoryColors[goal.category] },
                    ]}
                  />
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalCategory}>
                      {getGoalCategoryLabel(goal.category)}
                    </Text>
                  </View>
                </>
              )}
              {!goal && (
                <Text style={styles.goalName}>Deleted Goal</Text>
              )}
              <Badge
                label={`${goalStats.accuracy}%`}
                variant={
                  goalStats.accuracy >= 80
                    ? 'success'
                    : goalStats.accuracy >= 60
                    ? 'warning'
                    : 'error'
                }
              />
            </View>

            <View style={styles.trialsList}>
              {trials.map((trial, index) => (
                <View key={trial.id} style={styles.trialItem}>
                  <Text style={styles.trialNumber}>{index + 1}</Text>
                  <View style={styles.trialContent}>
                    <Text style={styles.trialPrompt}>{trial.prompt}</Text>
                    <Text style={styles.trialCue}>
                      {getCueLevelLabel(trial.cueLevel)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.trialResponseBadge,
                      { backgroundColor: RESPONSE_COLORS[trial.response] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trialResponseText,
                        { color: RESPONSE_COLORS[trial.response] },
                      ]}
                    >
                      {getResponseLabel(trial.response)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        );
      })}

      {/* Session Notes */}
      {session.notes && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{session.notes}</Text>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Delete Session"
          variant="danger"
          onPress={handleDelete}
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  date: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  time: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 32,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  headerStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    gap: 8,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  goalCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trialsList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  trialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trialNumber: {
    width: 24,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  trialContent: {
    flex: 1,
    marginLeft: 8,
  },
  trialPrompt: {
    fontSize: 14,
    color: Colors.text,
  },
  trialCue: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trialResponseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trialResponseText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    marginBottom: 32,
  },
});

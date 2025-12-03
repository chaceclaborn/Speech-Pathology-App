import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, ProgressBar, EmptyState } from '../components';
import { Colors, GoalCategoryColors } from '../utils/colors';
import { RootStackParamList } from '../types';
import {
  getGoalCategoryLabel,
  formatDate,
  calculateSessionStats,
} from '../utils/helpers';
import { format, parseISO } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'GoalDetail'>;

const screenWidth = Dimensions.get('window').width;

export const GoalDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { goalId, clientId } = route.params;

  const { getGoal, getSessionsByGoal, deleteGoal, updateGoal } = useApp();

  const goal = getGoal(goalId);
  const sessions = getSessionsByGoal(goalId);

  const progressData = useMemo(() => {
    if (sessions.length === 0) return null;

    const dataPoints = sessions
      .slice(0, 10)
      .reverse()
      .map((session) => {
        const goalTrials = session.trials.filter((t) => t.goalId === goalId);
        const stats = calculateSessionStats(goalTrials);
        return {
          date: format(parseISO(session.date), 'M/d'),
          accuracy: stats.accuracy,
        };
      });

    return {
      labels: dataPoints.map((d) => d.date),
      datasets: [
        {
          data: dataPoints.map((d) => d.accuracy),
          strokeWidth: 2,
        },
      ],
    };
  }, [sessions, goalId]);

  if (!goal) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Goal Not Found"
          message="This goal may have been deleted."
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? All trial data will be preserved in sessions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goalId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleStatusChange = async (status: 'active' | 'achieved' | 'discontinued') => {
    await updateGoal({
      ...goal,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'achieved':
        return <Badge label="Achieved" variant="success" />;
      case 'discontinued':
        return <Badge label="Discontinued" variant="error" />;
      default:
        return <Badge label="Active" variant="info" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Goal Header */}
      <View style={styles.header}>
        <View style={styles.categoryRow}>
          <View
            style={[
              styles.categoryDot,
              { backgroundColor: GoalCategoryColors[goal.category] },
            ]}
          />
          <Text style={styles.category}>{getGoalCategoryLabel(goal.category)}</Text>
          {getStatusBadge()}
        </View>
        <Text style={styles.name}>{goal.name}</Text>
        <Text style={styles.description}>{goal.description}</Text>
      </View>

      {/* Progress Card */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Current Progress</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressPercent}>{goal.currentAccuracy}%</Text>
            <Text style={styles.progressLabel}>Current</Text>
          </View>
          <View style={styles.progressBar}>
            <ProgressBar
              progress={goal.currentAccuracy}
              height={12}
              showLabel={false}
            />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressPercent}>{goal.targetAccuracy}%</Text>
            <Text style={styles.progressLabel}>Target</Text>
          </View>
        </View>
        {goal.currentAccuracy >= goal.targetAccuracy && goal.status === 'active' && (
          <View style={styles.achievedBanner}>
            <Text style={styles.achievedText}>
              Target reached! Mark as achieved?
            </Text>
            <Button
              title="Mark Achieved"
              size="small"
              onPress={() => handleStatusChange('achieved')}
            />
          </View>
        )}
      </Card>

      {/* Progress Chart */}
      {progressData && progressData.labels.length > 1 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Over Time</Text>
          <LineChart
            data={progressData}
            width={screenWidth - 64}
            height={200}
            yAxisSuffix="%"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: Colors.surface,
              backgroundGradientFrom: Colors.surface,
              backgroundGradientTo: Colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(74, 144, 164, ${opacity})`,
              labelColor: () => Colors.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: Colors.primary,
              },
            }}
            bezier
            style={styles.chart}
            fromZero
          />
        </Card>
      )}

      {/* Session History */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Session History</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions yet for this goal</Text>
        ) : (
          sessions.slice(0, 5).map((session) => {
            const goalTrials = session.trials.filter((t) => t.goalId === goalId);
            const stats = calculateSessionStats(goalTrials);
            return (
              <View key={session.id} style={styles.sessionItem}>
                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                <View style={styles.sessionStats}>
                  <Text style={styles.sessionStat}>
                    {stats.totalTrials} trials
                  </Text>
                  <Badge
                    label={`${stats.accuracy}%`}
                    variant={
                      stats.accuracy >= goal.targetAccuracy
                        ? 'success'
                        : stats.accuracy >= 60
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </View>
              </View>
            );
          })
        )}
      </Card>

      {/* Goal Actions */}
      <View style={styles.actions}>
        <Button
          title="Start Session with Goal"
          onPress={() =>
            navigation.navigate('NewSession', { clientId, goalIds: [goalId] })
          }
          fullWidth
        />

        {goal.status === 'active' && (
          <Button
            title="Discontinue Goal"
            variant="outline"
            onPress={() =>
              Alert.alert(
                'Discontinue Goal',
                'Are you sure you want to discontinue this goal?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Discontinue',
                    onPress: () => handleStatusChange('discontinued'),
                  },
                ]
              )
            }
            fullWidth
          />
        )}

        {goal.status !== 'active' && (
          <Button
            title="Reactivate Goal"
            variant="outline"
            onPress={() => handleStatusChange('active')}
            fullWidth
          />
        )}

        <Button
          title="Edit Goal"
          variant="ghost"
          onPress={() => navigation.navigate('EditGoal', { goalId, clientId })}
          fullWidth
        />

        <Button
          title="Delete Goal"
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
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  category: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    flex: 1,
  },
  achievedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.successLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  achievedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sessionDate: {
    fontSize: 14,
    color: Colors.text,
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionStat: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actions: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
});

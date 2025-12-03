import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { Card, Badge, EmptyState } from '../components';
import { Colors, GoalCategoryColors } from '../utils/colors';
import { RootStackParamList } from '../types';
import {
  calculateSessionStats,
  getGoalCategoryLabel,
  formatDate,
} from '../utils/helpers';
import { format, parseISO, subDays, isAfter } from 'date-fns';

type RouteProps = RouteProp<RootStackParamList, 'Reports'>;

const screenWidth = Dimensions.get('window').width;

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const ReportsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { clientId } = route.params;

  const { getClient, getGoalsByClient, getSessionsByClient } = useApp();

  const client = getClient(clientId);
  const goals = getGoalsByClient(clientId);
  const sessions = getSessionsByClient(clientId);

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const filteredSessions = useMemo(() => {
    if (timeRange === 'all') return sessions;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = subDays(new Date(), days);

    return sessions.filter((s) => isAfter(parseISO(s.date), cutoffDate));
  }, [sessions, timeRange]);

  const overallStats = useMemo(() => {
    const allTrials = filteredSessions.flatMap((s) => s.trials);
    return calculateSessionStats(allTrials);
  }, [filteredSessions]);

  const progressData = useMemo(() => {
    if (filteredSessions.length === 0) return null;

    const dataPoints = filteredSessions
      .slice(0, 10)
      .reverse()
      .map((session) => {
        const stats = calculateSessionStats(session.trials);
        return {
          date: format(parseISO(session.date), 'M/d'),
          accuracy: stats.accuracy,
        };
      });

    if (dataPoints.length < 2) return null;

    return {
      labels: dataPoints.map((d) => d.date),
      datasets: [
        {
          data: dataPoints.map((d) => d.accuracy),
          strokeWidth: 2,
        },
      ],
    };
  }, [filteredSessions]);

  const responseDistribution = useMemo(() => {
    const allTrials = filteredSessions.flatMap((s) => s.trials);
    if (allTrials.length === 0) return [];

    const stats = calculateSessionStats(allTrials);

    return [
      {
        name: 'Correct',
        count: stats.correctTrials,
        color: Colors.success,
        legendFontColor: Colors.text,
        legendFontSize: 12,
      },
      {
        name: 'Incorrect',
        count: stats.incorrectTrials,
        color: Colors.error,
        legendFontColor: Colors.text,
        legendFontSize: 12,
      },
      {
        name: 'Approx.',
        count: stats.approximationTrials,
        color: Colors.warning,
        legendFontColor: Colors.text,
        legendFontSize: 12,
      },
      {
        name: 'No Response',
        count: stats.noResponseTrials,
        color: Colors.textSecondary,
        legendFontColor: Colors.text,
        legendFontSize: 12,
      },
    ].filter((item) => item.count > 0);
  }, [filteredSessions]);

  const goalProgress = useMemo(() => {
    return goals
      .filter((g) => g.status === 'active' || g.status === 'achieved')
      .map((goal) => {
        const goalSessions = filteredSessions.filter((s) =>
          s.goals.includes(goal.id)
        );
        const goalTrials = goalSessions.flatMap((s) =>
          s.trials.filter((t) => t.goalId === goal.id)
        );
        const stats = calculateSessionStats(goalTrials);

        return {
          goal,
          sessionCount: goalSessions.length,
          trialCount: goalTrials.length,
          accuracy: stats.accuracy,
        };
      })
      .sort((a, b) => b.trialCount - a.trialCount);
  }, [goals, filteredSessions]);

  if (!client) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Client Not Found"
          message="This client may have been deleted."
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive,
              ]}
            >
              {range === 'all' ? 'All Time' : range.replace('d', ' Days')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{filteredSessions.length}</Text>
          <Text style={styles.summaryLabel}>Sessions</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{overallStats.totalTrials}</Text>
          <Text style={styles.summaryLabel}>Total Trials</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text
            style={[
              styles.summaryValue,
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
          <Text style={styles.summaryLabel}>Avg Accuracy</Text>
        </Card>
      </View>

      {/* Progress Chart */}
      {progressData && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Accuracy Over Time</Text>
          <LineChart
            data={progressData}
            width={screenWidth - 64}
            height={200}
            yAxisSuffix="%"
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

      {/* Response Distribution */}
      {responseDistribution.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Response Distribution</Text>
          <PieChart
            data={responseDistribution}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              color: () => Colors.primary,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>
      )}

      {/* Goal Progress */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Goal Progress</Text>
        {goalProgress.length === 0 ? (
          <Text style={styles.emptyText}>No goals with data in this period</Text>
        ) : (
          goalProgress.map(({ goal, sessionCount, trialCount, accuracy }) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <View
                  style={[
                    styles.goalDot,
                    { backgroundColor: GoalCategoryColors[goal.category] },
                  ]}
                />
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName} numberOfLines={1}>
                    {goal.name}
                  </Text>
                  <Text style={styles.goalMeta}>
                    {sessionCount} sessions • {trialCount} trials
                  </Text>
                </View>
                <Badge
                  label={`${accuracy}%`}
                  variant={
                    accuracy >= goal.targetAccuracy
                      ? 'success'
                      : accuracy >= 60
                      ? 'warning'
                      : 'error'
                  }
                />
              </View>
              <View style={styles.goalProgressBar}>
                <View
                  style={[
                    styles.goalProgressFill,
                    {
                      width: `${Math.min(100, (goal.currentAccuracy / goal.targetAccuracy) * 100)}%`,
                      backgroundColor:
                        goal.currentAccuracy >= goal.targetAccuracy
                          ? Colors.success
                          : Colors.primary,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.goalTargetMarker,
                    { left: `${Math.min(100, goal.targetAccuracy)}%` },
                  ]}
                />
              </View>
              <Text style={styles.goalTarget}>
                Current: {goal.currentAccuracy}% / Target: {goal.targetAccuracy}%
              </Text>
            </View>
          ))
        )}
      </Card>

      {/* Recent Sessions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {filteredSessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions in this period</Text>
        ) : (
          filteredSessions.slice(0, 10).map((session) => {
            const stats = calculateSessionStats(session.trials);
            return (
              <View key={session.id} style={styles.sessionItem}>
                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                <View style={styles.sessionStats}>
                  <Text style={styles.sessionStat}>{stats.totalTrials} trials</Text>
                  <Badge
                    label={`${stats.accuracy}%`}
                    variant={
                      stats.accuracy >= 80
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

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: Colors.textOnPrimary,
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
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
  goalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  goalMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginVertical: 8,
    position: 'relative',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalTargetMarker: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 10,
    backgroundColor: Colors.text,
    marginLeft: -1,
  },
  goalTarget: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: 32,
  },
});

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Card, Avatar, Button, Badge, ProgressBar, EmptyState } from '../components';
import { Colors, GoalCategoryColors } from '../utils/colors';
import { RootStackParamList, Goal, Session } from '../types';
import {
  calculateAge,
  formatDate,
  getGoalCategoryLabel,
  calculateSessionStats,
} from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ClientDetail'>;

export const ClientDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { clientId } = route.params;

  const {
    getClient,
    getGoalsByClient,
    getSessionsByClient,
    deleteClient,
    updateClient,
  } = useApp();

  const client = getClient(clientId);
  const goals = getGoalsByClient(clientId);
  const sessions = getSessionsByClient(clientId);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === 'active'),
    [goals]
  );

  const recentSessions = useMemo(
    () => sessions.slice(0, 5),
    [sessions]
  );

  if (!client) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Client Not Found"
          message="This client may have been deleted."
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.firstName} ${client.lastName}? This will also delete all their goals and sessions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteClient(clientId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleToggleActive = async () => {
    await updateClient({
      ...client,
      isActive: !client.isActive,
      updatedAt: new Date().toISOString(),
    });
  };

  const renderGoal = (goal: Goal) => (
    <TouchableOpacity
      key={goal.id}
      style={styles.goalItem}
      onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id, clientId })}
    >
      <View style={styles.goalHeader}>
        <View
          style={[
            styles.goalCategoryDot,
            { backgroundColor: GoalCategoryColors[goal.category] },
          ]}
        />
        <Text style={styles.goalName} numberOfLines={1}>
          {goal.name}
        </Text>
        <Text style={styles.goalChevron}>›</Text>
      </View>
      <ProgressBar
        progress={goal.currentAccuracy}
        showLabel
        labelPosition="right"
        style={styles.goalProgress}
      />
      <Text style={styles.goalTarget}>
        Target: {goal.targetAccuracy}%
      </Text>
    </TouchableOpacity>
  );

  const renderSession = (session: Session) => {
    const stats = calculateSessionStats(session.trials);
    return (
      <TouchableOpacity
        key={session.id}
        style={styles.sessionItem}
        onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id, clientId })}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
          <Badge
            label={`${stats.accuracy}%`}
            variant={stats.accuracy >= 80 ? 'success' : stats.accuracy >= 60 ? 'warning' : 'error'}
            size="small"
          />
        </View>
        <Text style={styles.sessionMeta}>
          {stats.totalTrials} trials • {session.duration} min
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Client Header */}
      <View style={styles.header}>
        <Avatar
          firstName={client.firstName}
          lastName={client.lastName}
          size="large"
        />
        <Text style={styles.name}>
          {client.firstName} {client.lastName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Age: {calculateAge(client.dateOfBirth)}</Text>
          {client.diagnosis && (
            <Text style={styles.meta}> • {client.diagnosis}</Text>
          )}
        </View>
        {!client.isActive && (
          <Badge label="Inactive" variant="default" style={styles.inactiveBadge} />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Button
          title="New Session"
          onPress={() => navigation.navigate('NewSession', { clientId })}
          style={styles.actionButton}
        />
        <Button
          title="Add Goal"
          variant="outline"
          onPress={() => navigation.navigate('AddGoal', { clientId })}
          style={styles.actionButton}
        />
      </View>

      {/* Active Goals */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          {activeGoals.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('AddGoal', { clientId })}>
              <Text style={styles.sectionAction}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>
        {activeGoals.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No active goals</Text>
            <Button
              title="Add First Goal"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('AddGoal', { clientId })}
              style={styles.emptySectionButton}
            />
          </View>
        ) : (
          activeGoals.map(renderGoal)
        )}
      </Card>

      {/* Recent Sessions */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {sessions.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Reports', { clientId })}>
              <Text style={styles.sectionAction}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        {recentSessions.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No sessions yet</Text>
            <Button
              title="Start First Session"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('NewSession', { clientId })}
              style={styles.emptySectionButton}
            />
          </View>
        ) : (
          recentSessions.map(renderSession)
        )}
      </Card>

      {/* Notes */}
      {client.notes && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{client.notes}</Text>
        </Card>
      )}

      {/* Client Actions */}
      <View style={styles.clientActions}>
        <Button
          title="Edit Client"
          variant="outline"
          onPress={() => navigation.navigate('EditClient', { clientId })}
          fullWidth
        />
        <Button
          title={client.isActive ? 'Mark as Inactive' : 'Mark as Active'}
          variant="ghost"
          onPress={handleToggleActive}
          fullWidth
          style={styles.toggleButton}
        />
        <Button
          title="Delete Client"
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
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  meta: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  inactiveBadge: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionAction: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptySectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  emptySectionButton: {
    marginTop: 8,
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
  goalCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  goalName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  goalChevron: {
    fontSize: 20,
    color: Colors.textLight,
  },
  goalProgress: {
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sessionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  sessionMeta: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notes: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  clientActions: {
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  toggleButton: {
    marginVertical: 4,
  },
});

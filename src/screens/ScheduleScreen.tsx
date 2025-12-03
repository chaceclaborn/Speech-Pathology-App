import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Card, Avatar, Badge, EmptyState } from '../components';
import { Colors } from '../utils/colors';
import { RootStackParamList, Session } from '../types';
import {
  formatDate,
  formatSessionDate,
  calculateSessionStats,
} from '../utils/helpers';
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ScheduleScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { sessions, clients, getClient } = useApp();

  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};

    sessions.forEach((session) => {
      const dateKey = format(parseISO(session.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    return grouped;
  }, [sessions]);

  const recentSessions = useMemo(() => {
    return sessions.slice(0, 20);
  }, [sessions]);

  const getSessionsForDay = (day: Date): Session[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return sessionsByDate[dateKey] || [];
  };

  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const renderDayCell = (day: Date) => {
    const daySessions = getSessionsForDay(day);
    const isToday = isSameDay(day, new Date());

    return (
      <View
        key={day.toISOString()}
        style={[styles.dayCell, isToday && styles.dayCellToday]}
      >
        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
          {format(day, 'EEE')}
        </Text>
        <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
          {format(day, 'd')}
        </Text>
        <View style={styles.sessionDots}>
          {daySessions.slice(0, 3).map((session, i) => (
            <View
              key={i}
              style={[
                styles.sessionDot,
                { backgroundColor: Colors.primary },
              ]}
            />
          ))}
          {daySessions.length > 3 && (
            <Text style={styles.moreSessions}>+{daySessions.length - 3}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSession = (session: Session) => {
    const client = getClient(session.clientId);
    if (!client) return null;

    const stats = calculateSessionStats(session.trials);

    return (
      <TouchableOpacity
        key={session.id}
        onPress={() =>
          navigation.navigate('SessionDetail', {
            sessionId: session.id,
            clientId: session.clientId,
          })
        }
      >
        <Card style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <Avatar
              firstName={client.firstName}
              lastName={client.lastName}
              size="small"
            />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionClient}>
                {client.firstName} {client.lastName}
              </Text>
              <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
            </View>
            <View style={styles.sessionStats}>
              <Text style={styles.sessionTrials}>{stats.totalTrials} trials</Text>
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
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Week Navigation */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={handlePrevWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToday}>
          <Text style={styles.weekTitle}>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Week Calendar */}
      <View style={styles.weekCalendar}>
        {weekDays.map(renderDayCell)}
      </View>

      {/* Session List */}
      <ScrollView style={styles.sessionList}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>

        {recentSessions.length === 0 ? (
          <EmptyState
            title="No Sessions Yet"
            message="Start a session with a client to see it here."
          />
        ) : (
          recentSessions.map(renderSession)
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '600',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  weekCalendar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayCellToday: {
    backgroundColor: Colors.primary + '15',
  },
  dayName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayNameToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  dayNumberToday: {
    color: Colors.primary,
  },
  sessionDots: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 3,
    alignItems: 'center',
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreSessions: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  sessionList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sessionCard: {
    marginBottom: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sessionClient: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  sessionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionTrials: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 32,
  },
});

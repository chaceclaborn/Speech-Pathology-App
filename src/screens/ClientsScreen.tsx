import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Card, Avatar, EmptyState, Badge } from '../components';
import { Colors } from '../utils/colors';
import { RootStackParamList, Client } from '../types';
import { calculateAge } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ClientsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { clients, isLoading, refreshData, getActiveGoalsByClient } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredClients = useMemo(() => {
    let result = clients;

    if (!showInactive) {
      result = result.filter((c) => c.isActive);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) =>
      `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
    );
  }, [clients, searchQuery, showInactive]);

  const renderClient = ({ item }: { item: Client }) => {
    const activeGoals = getActiveGoalsByClient(item.id);
    const age = calculateAge(item.dateOfBirth);

    return (
      <Card
        style={styles.clientCard}
        onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
      >
        <View style={styles.clientRow}>
          <Avatar firstName={item.firstName} lastName={item.lastName} size="medium" />
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.clientMeta}>
              Age: {age} {item.diagnosis ? `• ${item.diagnosis}` : ''}
            </Text>
            {activeGoals.length > 0 && (
              <Text style={styles.goalsCount}>
                {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          {!item.isActive && (
            <Badge label="Inactive" variant="default" size="small" />
          )}
          <Text style={styles.chevron}>›</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowInactive(!showInactive)}
        >
          <Text style={[styles.filterText, showInactive && styles.filterActive]}>
            {showInactive ? 'Hide Inactive' : 'Show All'}
          </Text>
        </TouchableOpacity>
      </View>

      {filteredClients.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No Results' : 'No Clients Yet'}
          message={
            searchQuery
              ? 'Try a different search term'
              : 'Add your first client to get started with tracking their progress.'
          }
          actionLabel={searchQuery ? undefined : 'Add Client'}
          onAction={searchQuery ? undefined : () => navigation.navigate('AddClient')}
        />
      ) : (
        <FlatList
          data={filteredClients}
          renderItem={renderClient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshData}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddClient')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  filterActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  clientCard: {
    marginBottom: 12,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  clientMeta: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  goalsCount: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textLight,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: Colors.textOnPrimary,
    lineHeight: 34,
  },
});

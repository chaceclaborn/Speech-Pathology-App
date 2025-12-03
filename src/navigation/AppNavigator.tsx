import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import {
  ClientsScreen,
  AddClientScreen,
  EditClientScreen,
  ClientDetailScreen,
  AddGoalScreen,
  EditGoalScreen,
  GoalDetailScreen,
  NewSessionScreen,
  SessionDetailScreen,
  ReportsScreen,
  ScheduleScreen,
  SettingsScreen,
} from '../screens';

import { Colors } from '../utils/colors';
import { RootStackParamList, MainTabsParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Simple icon components
const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const getIcon = () => {
    switch (name) {
      case 'Clients':
        return '👥';
      case 'Schedule':
        return '📅';
      case 'Reports':
        return '📊';
      case 'Settings':
        return '⚙️';
      default:
        return '📱';
    }
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconText, focused && styles.tabIconFocused]}>
        {getIcon()}
      </Text>
    </View>
  );
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Clients" focused={focused} />,
          headerTitle: 'My Clients',
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Schedule" focused={focused} />,
          headerTitle: 'Schedule',
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsOverviewScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Reports" focused={focused} />,
          headerTitle: 'Reports',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} />,
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Reports overview for the tab (not client-specific)
const ReportsOverviewScreen: React.FC = () => {
  return (
    <View style={styles.reportsOverview}>
      <Text style={styles.reportsTitle}>Select a Client</Text>
      <Text style={styles.reportsSubtitle}>
        To view reports, go to Clients and select a client, then tap "See All" in Recent Sessions.
      </Text>
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ClientDetail"
          component={ClientDetailScreen}
          options={{ title: 'Client Details' }}
        />
        <Stack.Screen
          name="AddClient"
          component={AddClientScreen}
          options={{ title: 'Add Client' }}
        />
        <Stack.Screen
          name="EditClient"
          component={EditClientScreen}
          options={{ title: 'Edit Client' }}
        />
        <Stack.Screen
          name="GoalDetail"
          component={GoalDetailScreen}
          options={{ title: 'Goal Details' }}
        />
        <Stack.Screen
          name="AddGoal"
          component={AddGoalScreen}
          options={{ title: 'Add Goal' }}
        />
        <Stack.Screen
          name="EditGoal"
          component={EditGoalScreen}
          options={{ title: 'Edit Goal' }}
        />
        <Stack.Screen
          name="SessionDetail"
          component={SessionDetailScreen}
          options={{ title: 'Session Details' }}
        />
        <Stack.Screen
          name="NewSession"
          component={NewSessionScreen}
          options={{ title: 'New Session' }}
        />
        <Stack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ title: 'Reports' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
  reportsOverview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  reportsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  reportsSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

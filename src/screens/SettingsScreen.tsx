import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../context/AppContext';
import { Card, Button, Input } from '../components';
import { Colors } from '../utils/colors';
import { exportAllData, importData, clearAllData } from '../services/storage';
import { format } from 'date-fns';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clients, goals, sessions, refreshData } = useApp();

  const [defaultDuration, setDefaultDuration] = useState(
    settings.defaultSessionDuration.toString()
  );
  const [defaultAccuracy, setDefaultAccuracy] = useState(
    settings.defaultTargetAccuracy.toString()
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSaveSettings = async () => {
    const duration = parseInt(defaultDuration) || 30;
    const accuracy = parseInt(defaultAccuracy) || 80;

    await updateSettings({
      ...settings,
      defaultSessionDuration: Math.max(5, Math.min(120, duration)),
      defaultTargetAccuracy: Math.max(1, Math.min(100, accuracy)),
    });

    Alert.alert('Saved', 'Settings have been updated.');
  };

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const data = await exportAllData();
      const fileName = `speech-therapy-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      const docDir = FileSystem.Paths.document;
      const file = new FileSystem.File(docDir, fileName);

      await file.create();
      await file.write(data);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Speech Therapy Data',
        });
      } else {
        Alert.alert('Export Complete', `Data saved to ${fileName}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Import Data',
      'This will merge imported data with existing data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setIsImporting(true);

            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });

              if (result.canceled) {
                setIsImporting(false);
                return;
              }

              const fileUri = result.assets[0].uri;
              const file = new FileSystem.File(fileUri);
              const content = await file.text();
              const success = await importData(content);

              if (success) {
                await refreshData();
                Alert.alert('Success', 'Data imported successfully.');
              } else {
                Alert.alert('Import Failed', 'Invalid backup file format.');
              }
            } catch (error) {
              console.error('Import error:', error);
              Alert.alert('Import Failed', 'Unable to import data. Please try again.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete ALL data? This includes all clients, goals, sessions, and settings. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete all your data. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete All',
                  style: 'destructive',
                  onPress: async () => {
                    await clearAllData();
                    await refreshData();
                    Alert.alert('Done', 'All data has been deleted.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Default Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Default Settings</Text>

        <Input
          label="Default Session Duration (minutes)"
          value={defaultDuration}
          onChangeText={setDefaultDuration}
          keyboardType="number-pad"
          hint="Used when creating new sessions"
        />

        <Input
          label="Default Target Accuracy (%)"
          value={defaultAccuracy}
          onChangeText={setDefaultAccuracy}
          keyboardType="number-pad"
          hint="Default goal accuracy target"
        />

        <Button
          title="Save Settings"
          onPress={handleSaveSettings}
          variant="outline"
          fullWidth
        />
      </Card>

      {/* App Statistics */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>App Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{clients.length}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{goals.length}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {sessions.reduce((acc, s) => acc + s.trials.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Trials</Text>
          </View>
        </View>
      </Card>

      {/* Data Management */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Export your data to create a backup or transfer to another device.
        </Text>

        <View style={styles.buttonGroup}>
          <Button
            title="Export All Data"
            onPress={handleExportData}
            loading={isExporting}
            variant="outline"
            fullWidth
          />

          <Button
            title="Import Data"
            onPress={handleImportData}
            loading={isImporting}
            variant="outline"
            fullWidth
          />
        </View>
      </Card>

      {/* Danger Zone */}
      <Card style={{ ...styles.section, ...styles.dangerSection }}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Text style={styles.dangerDescription}>
          Permanently delete all data from the app. This action cannot be undone.
        </Text>

        <Button
          title="Clear All Data"
          onPress={handleClearData}
          variant="danger"
          fullWidth
        />
      </Card>

      {/* About */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>App Name</Text>
          <Text style={styles.aboutValue}>Speech Therapy Pro</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Built with</Text>
          <Text style={styles.aboutValue}>React Native + Expo</Text>
        </View>
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
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  buttonGroup: {
    gap: 12,
  },
  dangerSection: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aboutLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  aboutValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 32,
  },
});

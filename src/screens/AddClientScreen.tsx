import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from '../components';
import { Colors } from '../utils/colors';
import { RootStackParamList, Client } from '../types';
import { generateId } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QUICK_DIAGNOSES = [
  'Articulation Disorder',
  'Phonological Disorder',
  'Childhood Apraxia of Speech',
  'Language Delay',
  'Autism Spectrum Disorder',
  'Fluency Disorder',
  'Voice Disorder',
];

export const AddClientScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addClient } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuickDiagnoses, setShowQuickDiagnoses] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (dateOfBirth.trim()) {
      const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(dateOfBirth.trim())) {
        newErrors.dateOfBirth = 'Enter date as MM/DD/YYYY';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForStorage = (date: string): string => {
    if (!date) return '';
    if (date.includes('/')) {
      const [month, day, year] = date.split('/');
      return year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
    }
    return date;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const newClient: Client = {
      id: generateId(),
      firstName: firstName.trim(),
      lastName: lastName.trim() || '',
      dateOfBirth: dateOfBirth.trim() ? formatDateForStorage(dateOfBirth.trim()) : '',
      diagnosis: diagnosis.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    const success = await addClient(newClient);
    setIsLoading(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save client. Please try again.');
    }
  };

  const handleQuickDiagnosis = (diag: string) => {
    setDiagnosis(diag);
    setShowQuickDiagnoses(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.tipCard}>
          <Text style={styles.tipText}>
            Only the first name is required - add details anytime!
          </Text>
        </Card>

        <Input
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChangeText={setFirstName}
          error={errors.firstName}
          required
          autoCapitalize="words"
          autoFocus
        />

        <Input
          label="Last Name"
          placeholder="Optional"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />

        <Input
          label="Date of Birth"
          placeholder="MM/DD/YYYY (optional)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          error={errors.dateOfBirth}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.diagnosisSection}>
          <Input
            label="Diagnosis"
            placeholder="Type or select below"
            value={diagnosis}
            onChangeText={setDiagnosis}
            autoCapitalize="sentences"
          />
          <TouchableOpacity
            style={styles.quickSelectToggle}
            onPress={() => setShowQuickDiagnoses(!showQuickDiagnoses)}
          >
            <Text style={styles.quickSelectText}>
              {showQuickDiagnoses ? 'Hide quick select' : 'Quick select diagnosis'}
            </Text>
          </TouchableOpacity>
          {showQuickDiagnoses && (
            <View style={styles.quickDiagnoses}>
              {QUICK_DIAGNOSES.map((diag) => (
                <TouchableOpacity
                  key={diag}
                  style={[
                    styles.quickDiagButton,
                    diagnosis === diag && styles.quickDiagButtonSelected,
                  ]}
                  onPress={() => handleQuickDiagnosis(diag)}
                >
                  <Text
                    style={[
                      styles.quickDiagText,
                      diagnosis === diag && styles.quickDiagTextSelected,
                    ]}
                  >
                    {diag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Input
          label="Notes"
          placeholder="Additional notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
          <Button
            title="Add Client"
            onPress={handleSave}
            loading={isLoading}
            style={styles.buttonPrimary}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  tipCard: { backgroundColor: Colors.primaryLight + '20', marginBottom: 20, padding: 12 },
  tipText: { fontSize: 14, color: Colors.primaryDark, textAlign: 'center' },
  diagnosisSection: { marginBottom: 8 },
  quickSelectToggle: { paddingVertical: 8, marginTop: -8 },
  quickSelectText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  quickDiagnoses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 16 },
  quickDiagButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  quickDiagButtonSelected: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  quickDiagText: { fontSize: 13, color: Colors.textSecondary },
  quickDiagTextSelected: { color: Colors.primary, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
  buttonPrimary: { flex: 2 },
});

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Button, Input, EmptyState } from '../components';
import { Colors } from '../utils/colors';
import { RootStackParamList } from '../types';
import { format, parseISO } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'EditClient'>;

export const EditClientScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { clientId } = route.params;

  const { getClient, updateClient } = useApp();
  const client = getClient(clientId);

  const [firstName, setFirstName] = useState(client?.firstName || '');
  const [lastName, setLastName] = useState(client?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    client ? format(parseISO(client.dateOfBirth), 'MM/dd/yyyy') : ''
  );
  const [diagnosis, setDiagnosis] = useState(client?.diagnosis || '');
  const [notes, setNotes] = useState(client?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(dateOfBirth.trim())) {
        newErrors.dateOfBirth = 'Enter date as MM/DD/YYYY or YYYY-MM-DD';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForStorage = (date: string): string => {
    if (date.includes('/')) {
      const [month, day, year] = date.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return date;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const updatedClient = {
      ...client,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: formatDateForStorage(dateOfBirth.trim()),
      diagnosis: diagnosis.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const success = await updateClient(updatedClient);

    setIsLoading(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to update client. Please try again.');
    }
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
        <Input
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChangeText={setFirstName}
          error={errors.firstName}
          required
          autoCapitalize="words"
        />

        <Input
          label="Last Name"
          placeholder="Enter last name"
          value={lastName}
          onChangeText={setLastName}
          error={errors.lastName}
          required
          autoCapitalize="words"
        />

        <Input
          label="Date of Birth"
          placeholder="MM/DD/YYYY"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          error={errors.dateOfBirth}
          required
          keyboardType="numbers-and-punctuation"
        />

        <Input
          label="Diagnosis"
          placeholder="e.g., Articulation disorder, Autism"
          value={diagnosis}
          onChangeText={setDiagnosis}
          autoCapitalize="sentences"
        />

        <Input
          label="Notes"
          placeholder="Additional notes about the client..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

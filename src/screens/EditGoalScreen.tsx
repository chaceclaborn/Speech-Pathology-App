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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { Button, Input, EmptyState } from '../components';
import { Colors, GoalCategoryColors } from '../utils/colors';
import { RootStackParamList, GoalCategory } from '../types';
import { getGoalCategoryLabel } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'EditGoal'>;

const CATEGORIES: GoalCategory[] = [
  'articulation',
  'language',
  'fluency',
  'voice',
  'pragmatics',
  'phonology',
  'other',
];

export const EditGoalScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { goalId } = route.params;

  const { getGoal, updateGoal } = useApp();
  const goal = getGoal(goalId);

  const [name, setName] = useState(goal?.name || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [category, setCategory] = useState<GoalCategory>(goal?.category || 'articulation');
  const [targetAccuracy, setTargetAccuracy] = useState(
    goal?.targetAccuracy.toString() || '80'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    const accuracy = parseInt(targetAccuracy);
    if (isNaN(accuracy) || accuracy < 1 || accuracy > 100) {
      newErrors.targetAccuracy = 'Enter a value between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const updatedGoal = {
      ...goal,
      name: name.trim(),
      description: description.trim(),
      category,
      targetAccuracy: parseInt(targetAccuracy),
      updatedAt: new Date().toISOString(),
    };

    const success = await updateGoal(updatedGoal);

    setIsLoading(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to update goal. Please try again.');
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
          label="Goal Name"
          placeholder="e.g., /s/ in initial position"
          value={name}
          onChangeText={setName}
          error={errors.name}
          required
        />

        <Input
          label="Description"
          placeholder="Detailed goal description with criteria..."
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          required
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>
          Category <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && {
                  backgroundColor: GoalCategoryColors[cat] + '20',
                  borderColor: GoalCategoryColors[cat],
                },
              ]}
              onPress={() => setCategory(cat)}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: GoalCategoryColors[cat] },
                ]}
              />
              <Text
                style={[
                  styles.categoryText,
                  category === cat && { color: GoalCategoryColors[cat] },
                ]}
              >
                {getGoalCategoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Target Accuracy (%)"
          placeholder="80"
          value={targetAccuracy}
          onChangeText={setTargetAccuracy}
          error={errors.targetAccuracy}
          required
          keyboardType="number-pad"
          hint="Goal is achieved when this accuracy is reached"
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
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

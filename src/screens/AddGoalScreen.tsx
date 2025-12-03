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
import { Button, Input, Card } from '../components';
import { Colors, GoalCategoryColors } from '../utils/colors';
import { RootStackParamList, Goal, GoalCategory } from '../types';
import { generateId, getGoalCategoryLabel } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'AddGoal'>;

const CATEGORIES: GoalCategory[] = [
  'articulation',
  'language',
  'fluency',
  'voice',
  'pragmatics',
  'phonology',
  'other',
];

// Goal templates for quick setup
const GOAL_TEMPLATES = [
  { name: '/s/ in initial position', category: 'articulation', description: 'Produce /s/ sound in initial position of words' },
  { name: '/r/ in all positions', category: 'articulation', description: 'Produce /r/ sound in initial, medial, and final positions' },
  { name: '/l/ blends', category: 'articulation', description: 'Produce /l/ blend clusters (bl, cl, fl, gl, pl, sl)' },
  { name: 'Final consonant deletion', category: 'phonology', description: 'Reduce final consonant deletion pattern' },
  { name: 'Following directions', category: 'language', description: 'Follow multi-step directions with increasing complexity' },
  { name: 'Vocabulary expansion', category: 'language', description: 'Learn and use new vocabulary words in context' },
  { name: 'Fluent speech', category: 'fluency', description: 'Produce fluent speech with reduced dysfluencies' },
  { name: 'Turn-taking', category: 'pragmatics', description: 'Demonstrate appropriate turn-taking in conversation' },
];

export const AddGoalScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { clientId } = route.params;

  const { addGoal, settings } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('articulation');
  const [targetAccuracy, setTargetAccuracy] = useState(
    settings.defaultTargetAccuracy.toString()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplates, setShowTemplates] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Only goal name is required!
    if (!name.trim()) {
      newErrors.name = 'Goal name is required';
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

    const newGoal: Goal = {
      id: generateId(),
      clientId,
      name: name.trim(),
      description: description.trim() || name.trim(),
      category,
      targetAccuracy: parseInt(targetAccuracy),
      currentAccuracy: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const success = await addGoal(newGoal);

    setIsLoading(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  const applyTemplate = (template: typeof GOAL_TEMPLATES[0]) => {
    setName(template.name);
    setDescription(template.description);
    setCategory(template.category as GoalCategory);
    setShowTemplates(false);
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
        {/* Quick Templates */}
        <TouchableOpacity
          style={styles.templateToggle}
          onPress={() => setShowTemplates(!showTemplates)}
        >
          <Text style={styles.templateToggleText}>
            {showTemplates ? 'Hide Templates' : 'Use a Template (Quick Start)'}
          </Text>
        </TouchableOpacity>

        {showTemplates && (
          <View style={styles.templates}>
            {GOAL_TEMPLATES.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateItem}
                onPress={() => applyTemplate(template)}
              >
                <View style={[styles.templateDot, { backgroundColor: GoalCategoryColors[template.category] }]} />
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateCategory}>{getGoalCategoryLabel(template.category as GoalCategory)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Input
          label="Goal Name"
          placeholder="e.g., /s/ in initial position"
          value={name}
          onChangeText={setName}
          error={errors.name}
          required
          autoFocus
        />

        <Input
          label="Description"
          placeholder="Optional - detailed goal criteria"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Category</Text>
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
          keyboardType="number-pad"
          hint="Goal is achieved when this accuracy is reached"
        />

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
          <Button
            title="Add Goal"
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
  templateToggle: {
    backgroundColor: Colors.primary + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  templateToggleText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  templates: { marginBottom: 16 },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  templateDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  templateInfo: { flex: 1 },
  templateName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  templateCategory: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  required: { color: Colors.error },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
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
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  categoryText: { fontSize: 14, color: Colors.textSecondary },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  button: { flex: 1 },
  buttonPrimary: { flex: 2 },
});

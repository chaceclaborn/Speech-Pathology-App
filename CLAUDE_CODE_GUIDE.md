# Claude Code Guide for Speech Therapy Pro

This guide explains how to add features and make modifications to the Speech Therapy Pro app using Claude Code.

## Quick Reference

### Adding a New Screen

1. Create the screen file in `src/screens/`:
```typescript
// src/screens/MyNewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';

export const MyNewScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>My New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
```

2. Export from `src/screens/index.ts`
3. Add to navigation in `src/navigation/AppNavigator.tsx`

### Adding a New Component

Create in `src/components/` and export from `index.ts`:
```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MyComponentProps {
  // props here
}

export const MyComponent: React.FC<MyComponentProps> = (props) => {
  return <View style={styles.container}>{/* content */}</View>;
};
```

### Adding New Data Types

Edit `src/types/index.ts`:
```typescript
export interface NewType {
  id: string;
  name: string;
  // ... other fields
}
```

### Adding Storage for New Data

Edit `src/services/storage.ts`:
```typescript
const STORAGE_KEYS = {
  // ... existing keys
  NEW_DATA: '@speech_therapy_new_data',
};

export const NewDataStorage = {
  async getAll(): Promise<NewType[]> {
    const data = await getItem<NewType[]>(STORAGE_KEYS.NEW_DATA);
    return data || [];
  },
  async save(item: NewType): Promise<boolean> {
    // ... implementation
  },
};
```

### Adding Context for New Data

Edit `src/context/AppContext.tsx`:
```typescript
// Add to state
const [newData, setNewData] = useState<NewType[]>([]);

// Add operations
const addNewData = async (item: NewType): Promise<boolean> => {
  // ... implementation
};

// Add to value object
const value = {
  // ... existing
  newData,
  addNewData,
};
```

## Common Tasks

### Change App Colors

Edit `src/utils/colors.ts`:
```typescript
export const Colors = {
  primary: '#YOUR_COLOR',    // Main brand color
  secondary: '#YOUR_COLOR',  // Secondary color
  // ... etc
};
```

### Add a New Goal Category

1. Edit `src/types/index.ts`:
```typescript
export type GoalCategory =
  | 'articulation'
  | 'language'
  // ... add here
  | 'your_new_category';
```

2. Edit `src/utils/colors.ts`:
```typescript
export const GoalCategoryColors: Record<string, string> = {
  // ... existing
  your_new_category: '#COLOR',
};
```

3. Edit `src/utils/helpers.ts`:
```typescript
export const getGoalCategoryLabel = (category: GoalCategory): string => {
  const labels: Record<GoalCategory, string> = {
    // ... existing
    your_new_category: 'Your Category Name',
  };
  return labels[category];
};
```

4. Add to category arrays in AddGoalScreen and EditGoalScreen

### Add a New Response Type

1. Edit `src/types/index.ts`:
```typescript
export interface Trial {
  // ...
  response: 'correct' | 'incorrect' | 'approximation' | 'no_response' | 'new_type';
}
```

2. Update `NewSessionScreen.tsx` RESPONSE_OPTIONS array
3. Update helpers if needed

### Add a New Cue Level

1. Edit `src/types/index.ts`:
```typescript
export type CueLevel =
  | 'independent'
  // ... existing
  | 'new_cue_level';
```

2. Update `src/utils/colors.ts` CueLevelColors
3. Update `src/utils/helpers.ts` getCueLevelLabel
4. Update NewSessionScreen CUE_LEVELS array

## Example Prompts for Claude Code

### "Add a notes field to clients"
Claude will:
1. Update the Client type
2. Add input to AddClientScreen and EditClientScreen
3. Display in ClientDetailScreen

### "Add email to client information"
Claude will:
1. Add email field to Client type
2. Add email input with validation
3. Update storage and context

### "Create a report export feature"
Claude will:
1. Create export function in services
2. Add button to ReportsScreen
3. Format data for PDF/CSV

### "Add dark mode support"
Claude will:
1. Create theme context
2. Add theme colors
3. Update all screens to use theme

### "Add client groups/tags"
Claude will:
1. Create Tag type
2. Add tag management UI
3. Add filter by tag functionality

## File Locations Quick Reference

| Feature | Location |
|---------|----------|
| Types | `src/types/index.ts` |
| Colors | `src/utils/colors.ts` |
| Storage | `src/services/storage.ts` |
| Context | `src/context/AppContext.tsx` |
| Navigation | `src/navigation/AppNavigator.tsx` |
| Components | `src/components/` |
| Screens | `src/screens/` |
| Helpers | `src/utils/helpers.ts` |

## Testing Changes

After making changes:
```bash
# Clear cache if needed
yarn start --clear

# Test on device
yarn ios  # or yarn android
```

## Common Issues

### "Module not found"
- Check export in index.ts files
- Verify import paths

### "Type errors"
- Update types in `src/types/index.ts`
- Check all usages of changed types

### "Navigation errors"
- Add route to RootStackParamList
- Add screen to navigator

### "Data not persisting"
- Check storage key is defined
- Verify save/load functions
- Check context updates

## Best Practices

1. **Keep components small**: One responsibility per component
2. **Use TypeScript**: Define types for all props and data
3. **Follow patterns**: Look at existing code for conventions
4. **Test on device**: Always test after changes
5. **Backup data**: Export before major changes

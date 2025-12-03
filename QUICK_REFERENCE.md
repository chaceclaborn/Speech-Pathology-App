# Quick Reference - Speech Therapy Pro

## Commands

```bash
# Start development
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android

# Clear cache
yarn start --clear

# Install new package
yarn add package-name
```

## Project Structure

```
src/
├── components/     # UI building blocks
├── context/        # App state (AppContext)
├── navigation/     # Screen navigation
├── screens/        # App screens
├── services/       # Data storage
├── types/          # TypeScript types
└── utils/          # Colors, helpers
```

## Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | App entry point |
| `src/types/index.ts` | All TypeScript types |
| `src/utils/colors.ts` | App color scheme |
| `src/context/AppContext.tsx` | Global state |
| `src/services/storage.ts` | Data persistence |

## Data Types

### Client
```typescript
{
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  diagnosis?: string
  notes?: string
  isActive: boolean
}
```

### Goal
```typescript
{
  id: string
  clientId: string
  name: string
  description: string
  category: GoalCategory
  targetAccuracy: number
  currentAccuracy: number
  status: 'active' | 'achieved' | 'discontinued'
}
```

### Session
```typescript
{
  id: string
  clientId: string
  date: string
  duration: number
  notes?: string
  goals: string[]
  trials: Trial[]
}
```

### Trial
```typescript
{
  id: string
  sessionId: string
  goalId: string
  prompt: string
  response: 'correct' | 'incorrect' | 'approximation' | 'no_response'
  cueLevel: CueLevel
}
```

## Goal Categories

| Category | Color |
|----------|-------|
| articulation | Red |
| language | Blue |
| fluency | Purple |
| voice | Teal |
| pragmatics | Orange |
| phonology | Pink |
| other | Gray |

## Cue Levels (Independence Order)

1. Independent
2. Verbal Cue
3. Visual Cue
4. Model
5. Partial Physical
6. Full Physical

## Color Palette

```typescript
primary: '#4A90A4'      // Teal blue
secondary: '#6B8E23'    // Olive green
success: '#27AE60'      // Green
warning: '#F39C12'      // Orange
error: '#E74C3C'        // Red
background: '#F5F7FA'   // Light gray
surface: '#FFFFFF'      // White
text: '#2C3E50'         // Dark blue-gray
```

## Using Context

```typescript
import { useApp } from '../context/AppContext';

const MyComponent = () => {
  const {
    clients,           // All clients
    addClient,         // Add new client
    updateClient,      // Update client
    deleteClient,      // Delete client
    getClient,         // Get single client

    goals,            // All goals
    addGoal,
    updateGoal,
    deleteGoal,
    getGoalsByClient,

    sessions,         // All sessions
    addSession,
    getSessionsByClient,

    settings,         // App settings
    updateSettings,

    isLoading,        // Loading state
    refreshData,      // Reload all data
  } = useApp();

  // ... use them
};
```

## Common Patterns

### Navigate to Screen
```typescript
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();
navigation.navigate('ScreenName', { param: value });
```

### Access Route Params
```typescript
import { useRoute } from '@react-navigation/native';
const route = useRoute();
const { clientId } = route.params;
```

### Style with Colors
```typescript
import { Colors } from '../utils/colors';
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
});
```

### Use Components
```typescript
import { Button, Card, Input, Avatar } from '../components';

<Button title="Save" onPress={handleSave} />
<Card onPress={handleTap}><Text>Content</Text></Card>
<Input label="Name" value={name} onChangeText={setName} />
<Avatar firstName="John" lastName="Doe" size="medium" />
```

## Quick Tasks

### Add new client field
1. Edit `src/types/index.ts` - Client interface
2. Edit `src/screens/AddClientScreen.tsx` - add input
3. Edit `src/screens/EditClientScreen.tsx` - add input
4. Edit `src/screens/ClientDetailScreen.tsx` - display

### Change colors
Edit `src/utils/colors.ts`

### Add screen to nav
1. Add to `src/navigation/AppNavigator.tsx`
2. Add type to `src/types/index.ts` RootStackParamList

### Export data
Go to Settings > Export All Data

## Troubleshooting

**Screen not loading**: Check navigation registration

**Data not saving**: Check storage.ts functions

**Types errors**: Update types/index.ts

**Styles broken**: Check Colors import

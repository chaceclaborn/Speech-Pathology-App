import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, GoalCategoryColors } from '../utils/colors';
import { GoalCategory } from '../types';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'category';
  category?: GoalCategory;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  category,
  size = 'medium',
  style,
}) => {
  const getBackgroundColor = (): string => {
    if (variant === 'category' && category) {
      return GoalCategoryColors[category] + '20'; // 20% opacity
    }

    switch (variant) {
      case 'success':
        return Colors.successLight;
      case 'warning':
        return Colors.warningLight;
      case 'error':
        return Colors.errorLight;
      case 'info':
        return Colors.infoLight;
      default:
        return Colors.border;
    }
  };

  const getTextColor = (): string => {
    if (variant === 'category' && category) {
      return GoalCategoryColors[category];
    }

    switch (variant) {
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'error':
        return Colors.error;
      case 'info':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        size === 'small' && styles.small,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'small' && styles.smallText,
          { color: getTextColor() },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
});

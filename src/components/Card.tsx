import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../utils/colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
}) => {
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...styles.card,
          shadowOpacity: 0.15,
          elevation: 4,
        };
      case 'outlined':
        return {
          ...styles.card,
          borderWidth: 1,
          borderColor: Colors.border,
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return styles.card;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

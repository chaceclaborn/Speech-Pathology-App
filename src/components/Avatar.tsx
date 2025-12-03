import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../utils/colors';
import { getInitials } from '../utils/helpers';

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

const AVATAR_COLORS = [
  '#E74C3C',
  '#3498DB',
  '#27AE60',
  '#9B59B6',
  '#F39C12',
  '#1ABC9C',
  '#E91E63',
  '#00BCD4',
];

export const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  size = 'medium',
  color,
  style,
}) => {
  const initials = getInitials(firstName, lastName);

  // Generate consistent color based on name
  const getColor = (): string => {
    if (color) return color;
    const nameHash = (firstName + lastName)
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[nameHash % AVATAR_COLORS.length];
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { width: 36, height: 36, borderRadius: 18 };
      case 'large':
        return { width: 72, height: 72, borderRadius: 36 };
      default:
        return { width: 48, height: 48, borderRadius: 24 };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 28;
      default:
        return 18;
    }
  };

  return (
    <View
      style={[
        styles.avatar,
        getSizeStyle(),
        { backgroundColor: getColor() },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: getFontSize() }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
});

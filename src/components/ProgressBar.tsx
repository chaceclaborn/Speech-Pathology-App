import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../utils/colors';
import { getAccuracyColor } from '../utils/helpers';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'right' | 'top';
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = false,
  labelPosition = 'right',
  color,
  backgroundColor = Colors.border,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const progressColor = color || getAccuracyColor(clampedProgress);

  const renderLabel = () => (
    <Text
      style={[
        styles.label,
        labelPosition === 'inside' && styles.labelInside,
        labelPosition === 'top' && styles.labelTop,
      ]}
    >
      {Math.round(clampedProgress)}%
    </Text>
  );

  return (
    <View style={[styles.container, style]}>
      {showLabel && labelPosition === 'top' && renderLabel()}
      <View style={styles.row}>
        <View
          style={[
            styles.track,
            { height, backgroundColor, borderRadius: height / 2 },
          ]}
        >
          <View
            style={[
              styles.progress,
              {
                width: `${clampedProgress}%`,
                backgroundColor: progressColor,
                borderRadius: height / 2,
              },
            ]}
          >
            {showLabel && labelPosition === 'inside' && clampedProgress > 20 && renderLabel()}
          </View>
        </View>
        {showLabel && labelPosition === 'right' && renderLabel()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  labelInside: {
    color: Colors.textOnPrimary,
    marginLeft: 0,
  },
  labelTop: {
    marginLeft: 0,
    marginBottom: 4,
  },
});

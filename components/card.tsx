import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from './app-text';
import { Fonts, BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ title, children, style }: CardProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.card }, style]}>
      {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  title: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.family.bold,
    marginBottom: Spacing.sm,
  },
});

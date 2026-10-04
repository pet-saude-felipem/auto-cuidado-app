import React from 'react';
import { Platform, StyleSheet, Text as NativeText, TextProps } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

export const SYSTEM_FONT = Platform.select({ ios: 'System', android: 'sans-serif', web: 'system-ui', default: 'System' })!;

export function AppText({ style, ...props }: TextProps) {
  const { fontPreference, textScale } = useTheme();
  const flat = StyleSheet.flatten(style) ?? {};
  const family = flat.fontFamily ?? Fonts.family.regular;
  const bold = family.includes('Bold');
  const italic = family.includes('Italic');
  return (
    <NativeText
      {...props}
      style={[style, {
        fontFamily: fontPreference === 'system' ? SYSTEM_FONT : family,
        fontSize: (typeof flat.fontSize === 'number' ? flat.fontSize : Fonts.size.sm) * textScale,
        lineHeight: typeof flat.lineHeight === 'number' ? flat.lineHeight * textScale : undefined,
        fontWeight: fontPreference === 'system' && bold ? '700' as const : flat.fontWeight,
        fontStyle: fontPreference === 'system' && italic ? 'italic' as const : flat.fontStyle,
      }]}
    />
  );
}

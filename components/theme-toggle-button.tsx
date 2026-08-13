import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { Fonts, Spacing, BorderRadius } from '@/constants/theme';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleTheme}
        style={[styles.button, { borderColor: theme.border }]}
      >
        {/* Bloco Esquerdo: Ícone com Fundo Branco */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="color-palette-outline"
            size={18}
            color={theme.primary}
          />
        </View>

        {/* Bloco Direito: Fundo suave e Texto */}
        <View
          style={[
            styles.textContainer,
            { backgroundColor: theme.primary + '18' }, // 18% de opacidade na cor primária
          ]}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>
            Mudar Tema
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end', // Alinha à direita no topo da tela
    marginVertical: Spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  iconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopRightRadius: BorderRadius.full,
    borderBottomRightRadius: BorderRadius.full,
  },
  buttonText: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.family.bold,
  },
});
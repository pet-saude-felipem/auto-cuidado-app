import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getRandomTip } from '@/src/mocks';

SplashScreen.preventAutoHideAsync();

function LoadingScreen({ tip }: { tip: string }) {
  return (
    <View style={loadingStyles.container}>
      <Text style={loadingStyles.title}>AutoCuidado</Text>
      <Text style={loadingStyles.subtitle}>Seu monitor de saúde pessoal</Text>
      <ActivityIndicator
        size="large"
        color={Colors.textOnPrimary}
        style={loadingStyles.spinner}
      />
      <View style={loadingStyles.tipContainer}>
        <Text style={loadingStyles.tipLabel}>💡 Dica de saúde</Text>
        <Text style={loadingStyles.tipText}>{tip}</Text>
      </View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: Fonts.size.title,
    fontWeight: Fonts.weight.bold,
    color: Colors.textOnPrimary,
  },
  subtitle: {
    fontSize: Fonts.size.md,
    color: Colors.textOnPrimary + 'CC',
    marginTop: Spacing.xs,
  },
  spinner: {
    marginTop: Spacing.xl,
  },
  tipContainer: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
    color: Colors.textOnPrimary + 'AA',
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Fonts.size.md,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [tip] = useState(getRandomTip);

  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.hideAsync();
      // Simula carregamento (futuro: carregar dados locais)
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setIsReady(true);
    };
    prepare();
  }, []);

  if (!isReady) {
    return <LoadingScreen tip={tip} />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

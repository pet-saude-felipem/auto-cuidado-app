import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getRandomTip } from '@/src/mocks';
import { ThemeProvider, useTheme } from '@/src/context/ThemeContext';

// Ignora aviso de Push Notifications no Expo Go (só usamos notificações locais)
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

SplashScreen.preventAutoHideAsync();

function LoadingScreen({ tip }: { tip: string }) {
  const { theme } = useTheme();

  return (
    <View style={[loadingStyles.container, { backgroundColor: theme.primary }]}>
      <Text style={loadingStyles.title}>AutoCuidado</Text>
      <Text style={loadingStyles.subtitle}>Seu monitor de saúde pessoal</Text>
      <ActivityIndicator
        size="large"
        color={theme.textOnPrimary}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: Fonts.size.title,
    fontFamily: Fonts.family.bold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.family.regular,
    color: '#FFFFFFCC',
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
    fontFamily: Fonts.family.bold,
    color: '#FFFFFFAA',
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.family.regular,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
});

function MainApp() {
  const [isReady, setIsReady] = useState(false);
  const [tip] = useState(getRandomTip);
  const { theme } = useTheme();

  const [fontsLoaded] = useFonts({
    'OpenDyslexic-Regular': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-Regular.otf'),
    'OpenDyslexic-Bold': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-Bold.otf'),
    'OpenDyslexic-Italic': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-Italic.otf'),
    'OpenDyslexic-BoldItalic': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-BoldItalic.otf'),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    const prepare = async () => {
      await SplashScreen.hideAsync();
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setIsReady(true);
    };
    prepare();
  }, [fontsLoaded]);

  if (!isReady) {
    return <LoadingScreen tip={tip} />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
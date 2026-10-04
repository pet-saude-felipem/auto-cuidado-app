import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Spacing, Themes } from '@/constants/theme';
import { ThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { medicationService, notificationService } from '@/src/services';

// Ignora aviso de Push Notifications no Expo Go (só usamos notificações locais)
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

SplashScreen.preventAutoHideAsync();

function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <StatusBar style="dark" />
      <Image
        source={require('../assets/images/saude-na-palma-da-mao-logo.png')}
        style={loadingStyles.logo}
        resizeMode="contain"
        accessibilityLabel="Saúde na Palma da Mão"
      />
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Themes.primary.background,
  },
  logo: { width: 180, height: 170 },
});

function MainApp() {
  const [isReady, setIsReady] = useState(false);
  const { theme, preferencesReady, medicationReminders } = useTheme();

  const [fontsLoaded] = useFonts({
    'OpenDyslexic-Regular': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-Regular.otf'),
    'OpenDyslexic-Bold': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-Bold.otf'),
    'OpenDyslexic-Italic': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-Italic.otf'),
    'OpenDyslexic-BoldItalic': require('../assets/fonts/opendyslexic-0.92/OpenDyslexic-BoldItalic.otf'),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    void SplashScreen.hideAsync();
    const timer = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  useEffect(() => {
    if (!preferencesReady) return;
    const refreshReminders = medicationReminders
      ? medicationService.getAllMedications().then((medications) =>
        notificationService.reconcileMedicationReminders(medications.map((medication) => medication.id)))
      : notificationService.cancelMedicationReminders();
    refreshReminders.catch((error) => console.warn('Não foi possível atualizar os lembretes:', error));
  }, [preferencesReady, medicationReminders]);

  if (!isReady || !preferencesReady) {
    return <LoadingScreen />;
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

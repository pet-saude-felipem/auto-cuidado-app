import React, { createContext, useContext, useEffect, useState } from 'react';
import { Themes, ThemeType } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontPreference = 'opendyslexic' | 'system';
export type TextSizePreference = 1 | 2 | 3 | 4 | 5;

type Preferences = {
  currentTheme: ThemeType;
  fontPreference: FontPreference;
  textLevel: TextSizePreference;
  medicationReminders: boolean;
  weightReminder: boolean;
};

interface ThemeContextData extends Preferences {
  theme: typeof Themes.primary;
  textScale: number;
  preferencesReady: boolean;
  setCurrentTheme: (value: ThemeType) => void;
  setFontPreference: (value: FontPreference) => void;
  setTextLevel: (value: TextSizePreference) => void;
  setMedicationReminders: (value: boolean) => void;
  setWeightReminder: (value: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);
const STORAGE_KEY = '@autocuidado/preferences';
const DEFAULT_PREFERENCES: Preferences = {
  currentTheme: 'primary',
  fontPreference: 'system',
  textLevel: 1,
  medicationReminders: true,
  weightReminder: true,
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted || !stored) return;
        const saved = JSON.parse(stored) as Partial<Preferences> & { textSize?: 'normal' | 'large'; schemaVersion?: number };
        const validLevel = typeof saved.textLevel === 'number' &&
          Number.isInteger(saved.textLevel) && saved.textLevel >= 1 && saved.textLevel <= 5;
        setPreferences({
          currentTheme: saved.currentTheme === 'secondary' || saved.currentTheme === 'blue' ? saved.currentTheme : 'primary',
          fontPreference: saved.schemaVersion === 2 && saved.fontPreference === 'opendyslexic' ? 'opendyslexic' : 'system',
          textLevel: validLevel ? saved.textLevel as TextSizePreference : saved.textSize === 'large' ? 2 : 1,
          medicationReminders: saved.medicationReminders !== false,
          weightReminder: saved.weightReminder !== false,
        });
      })
      .catch((error) => console.warn('Não foi possível carregar as preferências:', error))
      .finally(() => { if (mounted) setPreferencesReady(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...preferences, schemaVersion: 2 }))
      .catch((error) => console.warn('Não foi possível salvar as preferências:', error));
  }, [preferences, preferencesReady]);

  const update = (change: Partial<Preferences>) =>
    setPreferences((current) => ({ ...current, ...change }));

  const toggleTheme = () => {
    setPreferences((current) => ({
      ...current,
      currentTheme: current.currentTheme === 'primary' ? 'blue' : current.currentTheme === 'blue' ? 'secondary' : 'primary',
    }));
  };

  return (
    <ThemeContext.Provider value={{
      ...preferences,
      theme: Themes[preferences.currentTheme],
      textScale: 1 + (preferences.textLevel - 1) * 0.15,
      preferencesReady,
      setCurrentTheme: (value) => update({ currentTheme: value }),
      setFontPreference: (value) => update({ fontPreference: value }),
      setTextLevel: (value) => update({ textLevel: value }),
      setMedicationReminders: (value) => update({ medicationReminders: value }),
      setWeightReminder: (value) => update({ weightReminder: value }),
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

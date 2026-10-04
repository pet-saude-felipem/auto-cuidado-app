import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text, SYSTEM_FONT } from '@/components/app-text';
import { BorderRadius, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

const navItems: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  index: { label: 'Peso', icon: 'scale-outline' },
  medications: { label: 'Remédios', icon: 'medkit-outline' },
  history: { label: 'Histórico', icon: 'time-outline' },
  settings: { label: 'Configurações', icon: 'settings-outline' },
};

type NavRoute = BottomTabBarProps['state']['routes'][number];
type TabNavigation = BottomTabBarProps['navigation'];

function NavItem({ route, focused, navigation, expanded }: {
  route: NavRoute;
  focused: boolean;
  navigation: TabNavigation;
  expanded: boolean;
}) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const highlighted = focused || hovered;
  const highlightProgress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const highlightColor = theme.name === 'primary' ? '#BB7857' : theme.tabBarActive;
  const iconColor = highlighted ? highlightColor : theme.text;
  const pillColor = theme.name === 'primary' ? '#FAF0EB' : theme.tagBackground;
  const item = navItems[route.name];

  useEffect(() => {
    Animated.timing(highlightProgress, {
      toValue: highlighted ? 1 : 0,
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [highlighted, highlightProgress]);

  const animatePress = (pressed: boolean) => {
    Animated.spring(pressScale, {
      toValue: pressed ? 0.94 : 1,
      speed: 24,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: focused }}
      onPress={() => {
        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
      }}
      onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => { setHovered(true); animatePress(true); }}
      onPressOut={() => { setHovered(false); animatePress(false); }}
      style={[styles.navItem, { width: expanded ? '50%' : '25%' }]}
    >
      <Animated.View style={[styles.iconPill, { transform: [{ scale: pressScale }] }]}>
        <Animated.View style={[styles.pillBackground, { backgroundColor: pillColor, opacity: highlightProgress }]} />
        <Ionicons name={item.icon} size={27} color={iconColor} />
      </Animated.View>
      <Text style={[styles.navLabel, { color: iconColor, fontFamily: focused ? Fonts.family.bold : Fonts.family.regular }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme, textScale } = useTheme();
  const insets = useSafeAreaInsets();
  const expanded = textScale > 1.15;

  return (
    <View style={[styles.navBar, {
      backgroundColor: theme.tabBar,
      borderTopColor: theme.border,
      paddingBottom: Math.max(insets.bottom, Spacing.sm),
    }]}>
      {state.routes.map((route, index) => (
        <NavItem
          key={route.key}
          route={route}
          focused={state.index === index}
          navigation={navigation}
          expanded={expanded}
        />
      ))}
    </View>
  );
}

export default function TabLayout() {
  const { theme, fontPreference, textScale } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.textOnPrimary,
        headerTitleStyle: {
          fontFamily: fontPreference === 'system' ? SYSTEM_FONT : Fonts.family.bold,
          fontWeight: fontPreference === 'system' ? '700' : undefined,
          fontSize: Fonts.size.xl * textScale,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Peso' }} />
      <Tabs.Screen name="medications" options={{ title: 'Medicações' }} />
      <Tabs.Screen name="history" options={{ title: 'Histórico' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  navItem: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: Spacing.xs,
  },
  iconPill: {
    width: '84%',
    maxWidth: 92,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pillBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
  },
  navLabel: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});

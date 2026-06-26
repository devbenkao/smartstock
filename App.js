import React from 'react';
import { View, Text, StyleSheet, Platform, useColorScheme, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ScanScreen from './src/screens/ScanScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { getColors, FONT, RADIUS, SHADOW } from './src/theme';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Scan: { icon: 'scan-outline', iconActive: 'scan', label: 'Scan' },
  Inventory: { icon: 'cube-outline', iconActive: 'cube', label: 'Inventory' },
  Dashboard: { icon: 'grid-outline', iconActive: 'grid', label: 'Me' },
};

function CustomTabBar({ state, navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.tabBar }, SHADOW.tab]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const cfg = TAB_CONFIG[route.name];

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.tabPill,
                focused && { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons
                name={focused ? cfg.iconActive : cfg.icon}
                size={22}
                color={focused ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? colors.primary : colors.textTertiary },
                  focused && { fontWeight: FONT.weight.semibold },
                ]}
              >
                {cfg.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.tabBar,
      border: 'transparent',
      primary: colors.primary,
      text: colors.text,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen name="Scan" component={ScanScreen} />
          <Tab.Screen name="Inventory" component={InventoryScreen} />
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabPill: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  tabLabel: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    letterSpacing: 0.1,
  },
});

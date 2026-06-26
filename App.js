import React from 'react';
import { View, StyleSheet, Platform, useColorScheme, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ScanScreen from './src/screens/ScanScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { getColors, RADIUS, SHADOW } from './src/theme';

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
    <View style={styles.tabBarContainer} pointerEvents="box-none">
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? 'rgba(22,18,14,0.90)' : 'rgba(252,248,242,0.90)',
            borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)',
          },
          SHADOW.float,
        ]}
      >
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
              <View style={[styles.tabIcon, focused && { backgroundColor: colors.primary }]}>
                <Ionicons
                  name={focused ? cfg.iconActive : cfg.icon}
                  size={22}
                  color={focused ? '#FFFFFF' : colors.textTertiary}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

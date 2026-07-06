import 'react-native-gesture-handler'
import React from 'react'
import { StatusBar, StyleSheet, Platform } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Info, LayoutDashboard } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { MonitoringProvider } from './src/hooks/useMonitoringData'
import { DashboardPage } from './src/pages/DashboardPage'
import { ExplanationPage } from './src/pages/ExplanationPage'
import { colors } from './src/styles/theme'

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
      />
      <MonitoringProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.mutedForeground,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabBarLabel,
            }}
          >
            <Tab.Screen
              name="Dashboard"
              component={DashboardPage}
              options={{
                tabBarLabel: 'Dashboard',
                tabBarIcon: ({ color, size }) => (
                  <LayoutDashboard color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Sobre"
              component={ExplanationPage}
              options={{
                tabBarLabel: 'Sobre',
                tabBarIcon: ({ color, size }) => (
                  <Info color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        <Toast />
      </MonitoringProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
})

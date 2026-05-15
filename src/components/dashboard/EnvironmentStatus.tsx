import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { ShieldCheck, AlertTriangle } from 'lucide-react-native'
import { colors, radius, spacing } from '../../styles/theme'

interface EnvironmentStatusProps {
  hasAlert: boolean
}

export function EnvironmentStatus({ hasAlert }: EnvironmentStatusProps) {
  const opacity = useRef(new Animated.Value(1)).current
  const prevAlert = useRef(hasAlert)

  useEffect(() => {
    if (prevAlert.current !== hasAlert) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
      prevAlert.current = hasAlert
    }
  }, [hasAlert])

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity },
        hasAlert ? styles.alertContainer : styles.safeContainer,
      ]}
    >
      {hasAlert ? (
        <AlertTriangle size={20} color="#b91c1c" />
      ) : (
        <ShieldCheck size={20} color="#15803d" />
      )}
      <View style={styles.textBlock}>
        <Text style={[styles.title, hasAlert ? styles.alertTitle : styles.safeTitle]}>
          {hasAlert ? 'Alerta de Risco' : 'Ambiente Seguro'}
        </Text>
        <Text style={[styles.subtitle, hasAlert ? styles.alertSubtitle : styles.safeSubtitle]}>
          {hasAlert
            ? 'Valores acima do limite detectados'
            : 'Todos os indicadores estão normais'}
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing[3],
  },
  safeContainer: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  alertContainer: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
  },
  safeTitle: { color: '#15803d' },
  alertTitle: { color: '#b91c1c' },
  subtitle: {
    fontSize: 11,
  },
  safeSubtitle: { color: '#16a34a', opacity: 0.8 },
  alertSubtitle: { color: '#dc2626', opacity: 0.8 },
})

import React, { useEffect, useRef } from 'react'
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMonitoringData } from '../hooks/useMonitoringData'
import { StatusCard } from '../components/dashboard/StatusCard'
import { EnvironmentStatus } from '../components/dashboard/EnvironmentStatus'
import { TemperatureChart } from '../components/dashboard/TemperatureChart'
import { HistoryTable } from '../components/dashboard/HistoryTable'
import { colors, radius, spacing } from '../styles/theme'

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start()
    return () => opacity.stopAnimation()
  }, [])

  return (
    <Animated.View style={[styles.skeleton, { opacity }]} />
  )
}

export function DashboardPage() {
  const {
    records,
    latestRecord,
    isTemperatureAlert,
    isHumidityAlert,
    hasAlert,
    isLoading,
    error,
  } = useMonitoringData()

  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: spacing[6] + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Dashboard</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.skeletonRow}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <>
          <View style={styles.cardsRow}>
            <View style={styles.cardSlot}>
              <StatusCard
                type="temperature"
                value={latestRecord?.temperature ?? null}
                isAlert={isTemperatureAlert}
              />
            </View>
            <View style={styles.cardSlot}>
              <StatusCard
                type="humidity"
                value={latestRecord?.humidity ?? null}
                isAlert={isHumidityAlert}
              />
            </View>
          </View>

          <EnvironmentStatus hasAlert={hasAlert} />
          <TemperatureChart records={records} />
          <HistoryTable records={records} />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    gap: spacing[4],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  errorBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  skeleton: {
    flex: 1,
    height: 96,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cardSlot: {
    flex: 1,
  },
})

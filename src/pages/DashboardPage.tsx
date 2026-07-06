import React, { useEffect, useMemo, useRef } from 'react'
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { isSameMonth, parseISO } from 'date-fns'
import { Thermometer, Droplets } from 'lucide-react-native'
import { useMonitoringData } from '../hooks/useMonitoringData'
import { StatusCard } from '../components/dashboard/StatusCard'
import { EnvironmentStatus } from '../components/dashboard/EnvironmentStatus'
import { TemperatureChart } from '../components/dashboard/TemperatureChart'
import { HistoryTable } from '../components/dashboard/HistoryTable'
import { colors, radius, spacing, fontSize } from '../styles/theme'

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

  const monthAverages = useMemo(() => {
    const now = new Date()
    const monthRecords = records.filter((r) => {
      const date = parseISO(r.timestamp)
      return !Number.isNaN(date.getTime()) && isSameMonth(date, now)
    })

    if (monthRecords.length === 0) {
      return { avgTemperature: null, avgHumidity: null, count: 0 }
    }

    const { sumTemperature, sumHumidity } = monthRecords.reduce(
      (acc, r) => ({
        sumTemperature: acc.sumTemperature + r.temperature,
        sumHumidity: acc.sumHumidity + r.humidity,
      }),
      { sumTemperature: 0, sumHumidity: 0 }
    )

    return {
      avgTemperature: sumTemperature / monthRecords.length,
      avgHumidity: sumHumidity / monthRecords.length,
      count: monthRecords.length,
    }
  }, [records])

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

          <View style={styles.averagesCard}>
            <Text style={styles.averagesTitle}>Média de temperatura registrada</Text>
            <View style={styles.averagesRow}>
              <View style={styles.averagesItem}>
                <View style={styles.averagesLabel}>
                  <Thermometer size={14} color={colors.temp} />
                  <Text style={styles.averagesLabelText}>TEMPERATURA</Text>
                </View>
                <View style={styles.averagesValueRow}>
                  <Text style={styles.averagesValue}>
                    {monthAverages.avgTemperature !== null
                      ? monthAverages.avgTemperature.toFixed(1)
                      : '--'}
                  </Text>
                  <Text style={styles.averagesUnit}>°C</Text>
                </View>
              </View>
              <View style={styles.averagesItem}>
                <View style={styles.averagesLabel}>
                  <Droplets size={14} color={colors.humidity} />
                  <Text style={styles.averagesLabelText}>UMIDADE</Text>
                </View>
                <View style={styles.averagesValueRow}>
                  <Text style={styles.averagesValue}>
                    {monthAverages.avgHumidity !== null
                      ? monthAverages.avgHumidity.toFixed(1)
                      : '--'}
                  </Text>
                  <Text style={styles.averagesUnit}>%</Text>
                </View>
              </View>
            </View>
            <Text style={styles.averagesCount}>
              Baseado em {monthAverages.count} leituras do mês atual.
            </Text>
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
  averagesCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    gap: spacing[3],
  },
  averagesTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  averagesRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  averagesItem: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    padding: spacing[3],
    gap: spacing[1],
  },
  averagesLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  averagesLabelText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.mutedForeground,
    letterSpacing: 0.5,
  },
  averagesValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  averagesValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.foreground,
  },
  averagesUnit: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  averagesCount: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
  },
})

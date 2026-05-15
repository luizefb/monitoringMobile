import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { Thermometer, Droplets } from 'lucide-react-native'
import { colors, radius, spacing } from '../../styles/theme'

interface StatusCardProps {
  type: 'temperature' | 'humidity'
  value: number | null
  isAlert: boolean
}

const config = {
  temperature: {
    label: 'Temperatura',
    unit: '°C',
    Icon: Thermometer,
    bg: '#fff7ed',
    alertBg: '#fef2f2',
    iconBg: '#ffedd5',
    alertIconBg: '#fee2e2',
    iconColor: colors.temp,
    alertIconColor: colors.destructive,
  },
  humidity: {
    label: 'Umidade',
    unit: '%',
    Icon: Droplets,
    bg: '#ecfeff',
    alertBg: '#fef2f2',
    iconBg: '#cffafe',
    alertIconBg: '#fee2e2',
    iconColor: colors.humidity,
    alertIconColor: '#f87171',
  },
}

export function StatusCard({ type, value, isAlert }: StatusCardProps) {
  const c = config[type]
  const { Icon } = c

  const [containerWidth, setContainerWidth] = useState(0)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(12)).current
  const barWidth = useRef(new Animated.Value(0)).current
  const valueOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const delay = type === 'humidity' ? 80 : 0
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start()
  }, [])

  useEffect(() => {
    Animated.sequence([
      Animated.timing(valueOpacity, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(valueOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [value])

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: isAlert ? containerWidth : 0,
      duration: isAlert ? 300 : 200,
      useNativeDriver: false,
    }).start()
  }, [isAlert, containerWidth])

  const bgColor = isAlert ? c.alertBg : c.bg
  const iconBgColor = isAlert ? c.alertIconBg : c.iconBg
  const iconColor = isAlert ? c.alertIconColor : c.iconColor
  const valueColor = isAlert ? colors.destructive : colors.foreground

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: bgColor, opacity: fadeAnim, transform: [{ translateY }] },
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - spacing[4] * 2)}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>{c.label}</Text>
          <View style={styles.valueRow}>
            <Animated.Text style={[styles.value, { opacity: valueOpacity, color: valueColor }]}>
              {value !== null ? value.toFixed(1) : '--'}
            </Animated.Text>
            <Text style={styles.unit}>{c.unit}</Text>
          </View>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Icon size={20} color={iconColor} />
        </View>
      </View>
      {isAlert && (
        <View style={styles.barTrack}>
          <Animated.View style={[styles.bar, { width: barWidth }]} />
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.mutedForeground,
    marginBottom: spacing[1],
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
  },
  unit: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  iconContainer: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  barTrack: {
    marginTop: spacing[3],
    height: 2,
    backgroundColor: '#fecaca',
    borderRadius: 999,
    overflow: 'hidden',
  },
  bar: {
    height: 2,
    backgroundColor: '#f87171',
  },
})

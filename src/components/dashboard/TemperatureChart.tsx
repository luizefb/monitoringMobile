import React, { useMemo } from 'react'
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { colors, spacing } from '../../styles/theme'
import type { MonitoringRecord } from '../../types'

interface TemperatureChartProps {
  records: MonitoringRecord[]
}

export function TemperatureChart({ records }: TemperatureChartProps) {
  const { width } = useWindowDimensions()
  const chartWidth = width - 80

  const { tempData, humData, labels } = useMemo(() => {
    const last20 = records.slice(-20)

    const tempData = last20.map((r) => ({ value: r.temperature }))
    const humData = last20.map((r) => ({ value: r.humidity }))
    const labels = last20.map((r) =>
      format(new Date(r.timestamp), 'HH:mm', { locale: ptBR })
    )

    return { tempData, humData, labels }
  }, [records])

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sem dados para exibir</Text>
          </View>
        </CardContent>
      </Card>
    )
  }

  const minSpacing = 8
  const calcSpacing = tempData.length > 1
    ? Math.max(minSpacing, (chartWidth - 40) / (tempData.length - 1))
    : minSpacing

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        <View style={{ overflow: 'hidden' }}>
          <LineChart
            data={tempData}
            data2={humData}
            width={chartWidth}
            height={200}
            color1={colors.temp}
            color2={colors.humidity}
            thickness={2}
            hideDataPoints
            curved
            xAxisLabelTexts={labels}
            xAxisLabelTextStyle={{ color: '#9b958e', fontSize: 10 }}
            yAxisTextStyle={{ color: '#9b958e', fontSize: 10 }}
            rulesColor={colors.border}
            xAxisColor={colors.border}
            yAxisColor="transparent"
            initialSpacing={8}
            spacing={calcSpacing}
            noOfSections={4}
            yAxisThickness={0}
            xAxisThickness={1}
            disableScroll={false}
            scrollAnimation
            pointerConfig={{
              pointer1Color: colors.temp,
              pointer2Color: colors.humidity,
              pointerStripColor: colors.border,
              pointerStripWidth: 1,
              strokeDashArray: [4, 4],
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: { value: number; dataPointIndex: number }[]) => {
                const idx = items[0]?.dataPointIndex ?? 0
                const record = records.slice(-20)[idx]
                const fullTime = record
                  ? format(new Date(record.timestamp), 'dd/MM HH:mm', { locale: ptBR })
                  : ''
                return (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipTime}>{fullTime}</Text>
                    {items.map((item, i) => (
                      <Text
                        key={i}
                        style={[styles.tooltipValue, { color: i === 0 ? colors.temp : colors.humidity }]}
                      >
                        {i === 0 ? 'Temp: ' : 'Umid: '}
                        {item.value.toFixed(1)}
                        {i === 0 ? '°C' : '%'}
                      </Text>
                    ))}
                  </View>
                )
              },
            }}
          />
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.temp }]} />
            <Text style={styles.legendText}>Temperatura (°C)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.humidity }]} />
            <Text style={styles.legendText}>Umidade (%)</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    minWidth: 110,
  },
  tooltipTime: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    height: 8,
    width: 24,
    borderRadius: 999,
  },
  legendText: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
})

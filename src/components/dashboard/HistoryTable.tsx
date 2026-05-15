import React, { useMemo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { TEMP_ALERT_THRESHOLD, HUMIDITY_ALERT_THRESHOLD } from '../../types'
import { colors, spacing } from '../../styles/theme'
import type { MonitoringRecord } from '../../types'

interface HistoryTableProps {
  records: MonitoringRecord[]
}

export function HistoryTable({ records }: HistoryTableProps) {
  const sorted = useMemo(
    () => [...records].reverse().slice(0, 30),
    [records]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros</CardTitle>
      </CardHeader>
      <CardContent>
        <View style={styles.tableContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { flex: 1 }]}>Data / Hora</Text>
            <Text style={[styles.headerCell, styles.numericCell]}>Temp (°C)</Text>
            <Text style={[styles.headerCell, styles.numericCell]}>Umidade (%)</Text>
          </View>
          <ScrollView style={styles.scrollView} nestedScrollEnabled>
            {sorted.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
              </View>
            ) : (
              sorted.map((record, index) => (
                <View
                  key={record.id}
                  style={[
                    styles.dataRow,
                    index < sorted.length - 1 && styles.dataRowBorder,
                  ]}
                >
                  <Text style={[styles.dataCell, { flex: 1 }]}>
                    {format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </Text>
                  <Text
                    style={[
                      styles.dataCell,
                      styles.numericCell,
                      styles.numericValue,
                      {
                        color: record.temperature > TEMP_ALERT_THRESHOLD
                          ? colors.destructive
                          : colors.temp,
                      },
                    ]}
                  >
                    {record.temperature.toFixed(1)}
                  </Text>
                  <Text
                    style={[
                      styles.dataCell,
                      styles.numericCell,
                      styles.numericValue,
                      {
                        color: record.humidity > HUMIDITY_ALERT_THRESHOLD
                          ? colors.destructive
                          : colors.humidity,
                      },
                    ]}
                  >
                    {record.humidity.toFixed(1)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </CardContent>
    </Card>
  )
}

const styles = StyleSheet.create({
  tableContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.muted,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.mutedForeground,
  },
  numericCell: {
    width: 72,
    textAlign: 'right',
  },
  scrollView: {
    maxHeight: 288,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
  },
  dataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataCell: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  numericValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyRow: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
})

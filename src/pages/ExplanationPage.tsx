import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Activity, Database, Thermometer, Droplets, ShieldAlert } from 'lucide-react-native'
import { TEMP_ALERT_THRESHOLD, HUMIDITY_ALERT_THRESHOLD } from '../types'
import { colors, radius, spacing, fontSize } from '../styles/theme'

export function ExplanationPage() {
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: spacing[6] + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Sobre</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sobre o sistema</Text>
        <Text style={styles.paragraph}>
          Este sistema ajuda a acompanhar a{' '}
          <Text style={styles.emphasis}>temperatura</Text> e a{' '}
          <Text style={styles.emphasis}>umidade</Text> de um data center. A ideia é mostrar, de
          forma simples, se o ambiente está dentro do esperado e como os valores estão evoluindo ao
          longo do tempo.
        </Text>

        <View style={styles.row}>
          <Activity size={16} color={colors.mutedForeground} style={styles.icon} />
          <Text style={styles.rowText}>
            O dashboard atualiza automaticamente quando novas medições são enviadas.
          </Text>
        </View>

        <View style={styles.row}>
          <Database size={16} color={colors.mutedForeground} style={styles.icon} />
          <Text style={styles.rowText}>
            Você vê o valor mais recente, o histórico de medições e um gráfico para identificar
            tendências e picos.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Como interpretar o dashboard</Text>
        <Text style={styles.paragraph}>
          O sistema aponta <Text style={styles.emphasis}>risco</Text> quando a temperatura ou a
          umidade passam do limite definido para o data center. Quando isso acontece, aparece{' '}
          <Text style={styles.emphasis}>Alerta de Risco</Text> e os cards ficam destacados em
          vermelho.
        </Text>

        <View style={styles.row}>
          <Thermometer size={16} color={colors.temp} style={styles.icon} />
          <Text style={styles.rowText}>
            Temperatura entra em risco quando{' '}
            <Text style={styles.emphasis}>temperatura {'>'} {TEMP_ALERT_THRESHOLD}°C</Text>.
          </Text>
        </View>

        <View style={styles.row}>
          <Droplets size={16} color={colors.humidity} style={styles.icon} />
          <Text style={styles.rowText}>
            Umidade entra em risco quando{' '}
            <Text style={styles.emphasis}>umidade {'>'} {HUMIDITY_ALERT_THRESHOLD}%</Text>.
          </Text>
        </View>

        <View style={styles.row}>
          <ShieldAlert size={16} color={colors.destructive} style={styles.icon} />
          <Text style={styles.rowText}>
            Se qualquer um dos dois estiver acima do limite, o ambiente é marcado como{' '}
            <Text style={styles.emphasis}>em risco</Text>.
          </Text>
        </View>

        <Text style={styles.paragraph}>
          A seção <Text style={styles.emphasis}>Média de temperatura registrada</Text> mostra a
          média das medições do mês atual, ajudando a entender o comportamento geral do ambiente
          (além do valor "agora").
        </Text>
      </View>
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
  pageTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.foreground,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    gap: spacing[3],
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.foreground,
  },
  paragraph: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  emphasis: {
    fontWeight: '600',
    color: colors.foreground,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  icon: {
    marginTop: 2,
  },
  rowText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
})

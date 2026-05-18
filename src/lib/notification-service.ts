import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native'
import { Platform } from 'react-native'
import { TEMP_ALERT_THRESHOLD, HUMIDITY_ALERT_THRESHOLD } from '../types'
import type { MonitoringRecord } from '../types'

const CHANNEL_ID = 'monitoring-alerts'
const CHANNEL_NAME = 'Alertas de Monitoramento'

const COOLDOWN_MS = 60_000
const lastNotifiedAt: Record<'temperature' | 'humidity', number> = {
  temperature: 0,
  humidity: 0,
}

export async function setupNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    })
  }

  const settings = await notifee.requestPermission()
  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
    console.warn('[Notifications] Permissão negada pelo usuário.')
  }
}

export async function sendAlertNotification(
  type: 'temperature' | 'humidity',
  value: number,
): Promise<void> {
  const now = Date.now()
  if (now - lastNotifiedAt[type] < COOLDOWN_MS) return
  lastNotifiedAt[type] = now

  const isTemp = type === 'temperature'
  const title = isTemp ? '🌡️ Alerta de Temperatura' : '💧 Alerta de Umidade'
  const body = isTemp
    ? `Temperatura em ${value.toFixed(1)}°C — acima do limite de ${TEMP_ALERT_THRESHOLD}°C`
    : `Umidade em ${value.toFixed(1)}% — acima do limite de ${HUMIDITY_ALERT_THRESHOLD}%`

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  })
}

export function checkAndNotify(record: MonitoringRecord): void {
  if (record.temperature > TEMP_ALERT_THRESHOLD) {
    void sendAlertNotification('temperature', record.temperature)
  }
  if (record.humidity > HUMIDITY_ALERT_THRESHOLD) {
    void sendAlertNotification('humidity', record.humidity)
  }
}

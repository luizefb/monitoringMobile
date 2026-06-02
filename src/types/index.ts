export interface MonitoringRecord {
  id: string
  timestamp: string
  temperature: number
  humidity: number
  /** Identificador do controlador que enviou a leitura (opcional) */
  controller?: string
}

export interface MonitoringContextType {
  records: MonitoringRecord[]
  addRecord: (temperature: number) => Promise<void>
  latestRecord: MonitoringRecord | null
  isTemperatureAlert: boolean
  isHumidityAlert: boolean
  hasAlert: boolean
  /** true enquanto carrega os dados iniciais */
  isLoading: boolean
  /** Mensagem de erro, se houver falha de conexão */
  error: string | null
  /** true quando conectado ao Supabase */
  isLive: boolean
}

export const TEMP_ALERT_THRESHOLD = 24
export const HUMIDITY_ALERT_THRESHOLD = 59

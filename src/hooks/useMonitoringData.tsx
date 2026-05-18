import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { MonitoringContextType, MonitoringRecord } from "../types"
import { TEMP_ALERT_THRESHOLD, HUMIDITY_ALERT_THRESHOLD } from "../types"
import { isSupabaseConfigured } from "../lib/supabase"
import {
  fetchRecords,
  insertRecord,
  subscribeToRecords,
  unsubscribeFromRecords,
} from "../lib/monitoring-service"
import { setupNotifications, checkAndNotify } from "../lib/notification-service"

const MonitoringContext = createContext<MonitoringContextType | null>(null)

export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<MonitoringRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void setupNotifications()
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.")
      setIsLoading(false)
      return
    }

    let cancelled = false

    fetchRecords()
      .then((data) => {
        if (!cancelled) {
          setRecords(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[Supabase] Erro ao carregar registros:", err)
          setError("Não foi possível conectar ao banco de dados.")
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || isLoading) return

    const channel = subscribeToRecords((newRecord) => {
      setRecords((prev) => {
        const exists = prev.some((r) => r.id === newRecord.id)
        return exists ? prev : [...prev, newRecord]
      })
      checkAndNotify(newRecord)
    })

    return () => {
      unsubscribeFromRecords(channel)
    }
  }, [isLoading])

  const addRecord = useCallback(async (temperature: number) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado.")
    }

    const record = await insertRecord(temperature)
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === record.id)
      return exists ? prev : [...prev, record]
    })
  }, [])

  const latestRecord = records.length > 0 ? records[records.length - 1] : null
  const isTemperatureAlert =
    latestRecord !== null && latestRecord.temperature > TEMP_ALERT_THRESHOLD
  const isHumidityAlert =
    latestRecord !== null && latestRecord.humidity > HUMIDITY_ALERT_THRESHOLD
  const hasAlert = isTemperatureAlert || isHumidityAlert

  return (
    <MonitoringContext.Provider
      value={{
        records,
        addRecord,
        latestRecord,
        isTemperatureAlert,
        isHumidityAlert,
        hasAlert,
        isLoading,
        error,
        isLive: isSupabaseConfigured,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  )
}

export function useMonitoringData(): MonitoringContextType {
  const context = useContext(MonitoringContext)
  if (!context) {
    throw new Error("useMonitoringData must be used within a MonitoringProvider")
  }
  return context
}

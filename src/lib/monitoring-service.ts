import { supabase } from "./supabase"
import { DB_CONFIG } from "./db"
import type { MonitoringRecord } from "../types"
import type { RealtimeChannel } from "@supabase/supabase-js"

const { table, humidityTable, columns, initialLimit } = DB_CONFIG

type DbRow = Record<string, unknown>

function toMs(value: unknown): number {
  return new Date(String(value)).getTime()
}

function rowToRecord(temperatureRow: DbRow, humidityValue: number): MonitoringRecord {
  return {
    id: String(temperatureRow[columns.id]),
    timestamp: String(temperatureRow[columns.timestamp]),
    temperature: Number(temperatureRow[columns.temperature]),
    humidity: humidityValue,
  }
}

async function fetchLatestHumidity(): Promise<number> {
  const { data, error } = await supabase!
    .from(humidityTable)
    .select(columns.humidity)
    .order(columns.timestamp, { ascending: false })
    .limit(1)

  if (error) throw error

  const value = Number(data?.[0]?.[columns.humidity])
  if (Number.isNaN(value)) throw new Error("Nenhuma leitura de umidade disponível.")
  return value
}

/**
 * Ambos os arrays de entrada devem estar ordenados por timestamp CRESCENTE.
 */
function pairRecords(temperatureRows: DbRow[], humidityRows: DbRow[]): MonitoringRecord[] {
  const sortedTemp = [...temperatureRows].sort((a, b) => toMs(a[columns.timestamp]) - toMs(b[columns.timestamp]))
  const sortedHum = [...humidityRows].sort((a, b) => toMs(a[columns.timestamp]) - toMs(b[columns.timestamp]))

  let humIdx = 0
  const records: MonitoringRecord[] = []

  for (const tempRow of sortedTemp) {
    const tempMs = toMs(tempRow[columns.timestamp])

    while (
      humIdx + 1 < sortedHum.length &&
      toMs(sortedHum[humIdx + 1][columns.timestamp]) <= tempMs
    ) {
      humIdx += 1
    }

    const humRow = sortedHum[humIdx]
    if (!humRow) continue

    const temperature = Number(tempRow[columns.temperature])
    const humidity = Number(humRow[columns.humidity])

    if (Number.isNaN(temperature) || Number.isNaN(humidity)) continue

    records.push(rowToRecord(tempRow, humidity))
  }

  return records
}

/** Busca os registros mais recentes combinando temperatura e umidade. */
export async function fetchRecords(): Promise<MonitoringRecord[]> {
  if (!supabase) throw new Error("Supabase não configurado")

  const [
    { data: tempData, error: tempError },
    { data: humData, error: humError },
  ] = await Promise.all([
    supabase.from(table).select("*").order(columns.timestamp, { ascending: false }).limit(initialLimit),
    supabase.from(humidityTable).select("*").order(columns.timestamp, { ascending: false }).limit(initialLimit),
  ])

  if (tempError) throw tempError
  if (humError) throw humError

  return pairRecords(tempData ?? [], humData ?? [])
}

/** Insere um novo registro de temperatura e o retorna com a umidade atual.
 *
 *  DESATIVADO NO MOMENTO */
export async function insertRecord(temperature: number): Promise<MonitoringRecord> {
  if (!supabase) throw new Error("Supabase não configurado")

  const [latestHumidity, { data, error }] = await Promise.all([
    fetchLatestHumidity(),
    supabase
      .from(table)
      .insert({ [columns.temperature]: Math.round(temperature * 10) / 10 })
      .select()
      .single(),
  ])

  if (error) throw error

  return rowToRecord(data, latestHumidity)
}

/** Cria uma subscription realtime para novos registros de temperatura. */
export function subscribeToRecords(onInsert: (record: MonitoringRecord) => void): RealtimeChannel {
  if (!supabase) throw new Error("Supabase não configurado")

  let latestHumidity = 0

  void fetchLatestHumidity().then((value) => { latestHumidity = value })

  return supabase
    .channel("monitoring-realtime")
    .on("postgres_changes", { event: "INSERT", schema: "public", table }, (payload) => {
      onInsert(rowToRecord(payload.new as DbRow, latestHumidity))
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: humidityTable }, (payload) => {
      const newValue = Number((payload.new as DbRow)[columns.humidity])
      if (!Number.isNaN(newValue)) latestHumidity = newValue
    })
    .subscribe()
}

/** Remove a subscription realtime. */
export async function unsubscribeFromRecords(channel: RealtimeChannel): Promise<void> {
  if (!supabase) return
  await supabase.removeChannel(channel)
}

export const DB_CONFIG = {
  table: "TemperatureRegister",
  humidityTable: "HumidityRegister",

  columns: {
    id: "id",
    timestamp: "created_at",
    temperature: "value",
    humidity: "value",
  },

  initialLimit: 100,
} as const

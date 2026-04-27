#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>

// --- Credenciais de Rede ---
const char* ssid = "SSID";
const char* password = "password";

// --- Credenciais Supabase ---
const char* supabaseUrlTemp = "https://seuurl.supabase.co/rest/v1/TemperatureRegister";
const char* supabaseUrlHum = "https://seuurl.supabase.co/rest/v1/HumidityRegister";
const char* supabaseKey = "suachave";

// --- Configuração DS18B20 (Temperatura) ---
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// --- Configuração DHT11 (Umidade) ---
#define DHTPIN 5
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  
  sensors.begin();
  dht.begin();
  
  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nSistema Online!");
}

// Função auxiliar para enviar dados ao Supabase
void enviarAoSupabase(String url, float valor) {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;

  if (http.begin(client, url)) {
    http.setTimeout(15000);
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Prefer", "return=minimal");

    String json = "{\"value\":" + String(valor) + "}";
    int responseCode = http.POST(json);

    if (responseCode >= 200 && responseCode < 300) {
      Serial.printf("Enviado com sucesso para %s: %.2f\n", url.substring(url.lastIndexOf('/')).c_str(), valor);
    } else {
      Serial.printf("Erro ao enviar para %s. Código: %d\n", url.c_str(), responseCode);
    }
    http.end();
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Leitura DS18B20
    sensors.requestTemperatures();
    float tempDS = sensors.getTempCByIndex(0);

    // 2. Leitura DHT11
    float umidDHT = dht.readHumidity();

    // Verificação de erros nas leituras
    if (tempDS != DEVICE_DISCONNECTED_C) {
      enviarAoSupabase(supabaseUrlTemp, tempDS);
    } else {
      Serial.println("Erro: DS18B20 desconectado!");
    }

    if (!isnan(umidDHT)) {
      enviarAoSupabase(supabaseUrlHum, umidDHT);
    } else {
      Serial.println("Erro: Falha na leitura do DHT11!");
    }
  }

  // Intervalo de 1 minuto para monitoramento
  Serial.println("Aguardando próximo ciclo...");
  delay(60000);
}

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WEB_URL = 'https://monitoring-app-hazel.vercel.app/';

function AppContent() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: WEB_URL }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

export default App;

import React, { useCallback, useRef, useState } from 'react'
import { BackHandler, Linking, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { WebView } from 'react-native-webview'
import Constants from 'expo-constants'

type WebViewNavState = {
  canGoBack: boolean
  url: string
}

const DEFAULT_URL = 'https://sajuhae.vercel.app'
const WEB_APP_URL =
  (Constants.expoConfig?.extra?.webAppUrl as string | undefined) ?? DEFAULT_URL

const ALLOW_ORIGIN = WEB_APP_URL.replace(/\/$/, '')

function isInternalUrl(url: string): boolean {
  return url.startsWith(ALLOW_ORIGIN)
}

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const [canGoBack, setCanGoBack] = useState(false)

  const onNavStateChange = useCallback((state: WebViewNavState) => {
    setCanGoBack(state.canGoBack)
  }, [])

  const onShouldStartLoadWithRequest = useCallback((request: { url: string }) => {
    const { url } = request
    if (isInternalUrl(url)) return true

    void Linking.openURL(url)
    return false
  }, [])

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack()
        return true
      }
      return false
    })

    return () => sub.remove()
  }, [canGoBack])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: WEB_APP_URL }}
          originWhitelist={[ALLOW_ORIGIN, `${ALLOW_ORIGIN}/*`]}
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          onNavigationStateChange={onNavStateChange}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          setSupportMultipleWindows={false}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  }
})

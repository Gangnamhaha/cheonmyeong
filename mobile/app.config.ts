import type { ExpoConfig } from 'expo/config'

const webAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://sajuhae.vercel.app'
const easProjectId =
  process.env.EAS_PROJECT_ID ?? 'a3b25b0c-9653-4967-83f0-82aa5e703214'

const config: ExpoConfig = {
  name: '사주해',
  slug: 'sajuhae-mobile',
  scheme: 'sajuhae',
  version: '1.0.0',
  orientation: 'portrait',
  icon: '../app_icon_1024.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: '../app_icon_1024.png',
    resizeMode: 'contain',
    backgroundColor: '#0f172a'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.sajuhae.mobile',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    package: 'com.sajuhae.mobile',
    adaptiveIcon: {
      foregroundImage: '../app_icon_1024.png',
      backgroundColor: '#0f172a'
    }
  },
  extra: {
    webAppUrl,
    eas: {
      projectId: easProjectId
    }
  },
  owner: process.env.EXPO_OWNER,
  plugins: []
}

export default config

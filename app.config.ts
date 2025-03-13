import 'dotenv/config';

import type {ConfigContext, ExpoConfig} from '@expo/config';
import withAndroidLocalizedName from '@mmomtchev/expo-android-localized-app-name';

import {version} from './package.json';
import dotenv from 'dotenv';
import {expand} from 'dotenv-expand';
import path from 'path';

const DEEP_LINK_URL = '[firebaseAppId].web.app';

// https://github.com/expo/expo/issues/23727#issuecomment-1651609858
if (process.env.STAGE) {
  expand(
    dotenv.config({
      path: path.join(
        __dirname,
        ['./.env', process.env.STAGE].filter(Boolean).join('.'),
      ),
      override: true,
    }),
  );
}

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Cross-Platform Korea',
  scheme: 'cpk',
  slug: 'cpk',
  platforms: ['ios', 'android', 'web'],
  version,
  orientation: 'default',
  icon: './assets/icon.png',
  backgroundColor: '#343434',
  plugins: [
    [
      'expo-build-properties',
      {
        // https://github.com/software-mansion/react-native-screens/issues/2219
        ios: {newArchEnabled: true, deploymentTarget: '15.1'},
        android: {newArchEnabled: true},
      },
    ],
    // @ts-ignore
    withAndroidLocalizedName,
    'expo-secure-store',
    'expo-router',
    'expo-localization',
    [
      'expo-font',
      {
        fonts: [
          'node_modules/cpk-ui/components/uis/Icon/cpk.ttf',
          'node_modules/cpk-ui/components/uis/Icon/Pretendard-Bold.otf',
          'node_modules/cpk-ui/components/uis/Icon/Pretendard-Regular.otf',
          'node_modules/cpk-ui/components/uis/Icon/Pretendard-Thin.otf',
        ],
      },
    ],
    'expo-iap',
    [
      'expo-notifications',
      {
        icon: './assets/notification_icon.png',
        color: '#ffffff',
        defaultChannel: 'default',
      },
    ],
    'expo-localization',
    [
      'expo-splash-screen',
      // https://github.com/expo/expo/issues/32515#issuecomment-2533398853
      {
        image: './assets/icon.png',
        backgroundColor: '#333333',
        imageWidth: 200,
        dark: {backgroundColor: '#1B1B1B'},
        ios: {
          resizeMode: 'cover',
          image: './assets/splash.png',
        },
        // iOS only
        enableFullScreenImage_legacy: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {projectId: '1a0107b0-1cef-4913-875f-639c38f59101'},
  },
  updates: {
    fallbackToCacheTimeout: 0,
    requestHeaders: {'expo-channel-name': 'production'},
    url: 'https://u.expo.dev/1a0107b0-1cef-4913-875f-639c38f59101',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  assetBundlePatterns: ['**/*'],
  userInterfaceStyle: 'automatic',
  locales: {
    ko: './assets/langs/ios/ko.json',
  },
  ios: {
    bundleIdentifier: 'com.crossplatformkorea.app',
    associatedDomains: [`applinks:${DEEP_LINK_URL}`],
    supportsTablet: true,
    entitlements: {
      'com.apple.developer.applesignin': ['Default'],
    },
    googleServicesFile: process.env.GOOGLE_SERVICES_IOS,
    infoPlist: {
      LSApplicationQueriesSchemes: ['mailto'],
      CFBundleAllowMixedLocalizations: true,
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            'com.googleusercontent.apps.428953626787-se8c0qsmoe5hjfmfhljk9ggijcvjtcbi',
          ],
        },
      ],
      NSMicrophoneUsageDescription:
        // eslint-disable-next-line max-len
        'We requests access to your microphone to enable audio recording while capturing videos within the app. For example, if you choose to record a video message or a voice note, we will use the microphone to capture your audio, ensuring that your recordings include sound. This allows you to share videos with clear audio. Users can revoke this permission at any time in the settings.',
      NSCameraUsageDescription:
        // eslint-disable-next-line max-len
        'We requests access to your camera to allow you to take photos and record videos to share with others on the platform. For instance, you can capture moments during live events and share them directly through our app. Users can revoke this permission at any time in the settings.',
      NSPhotoLibraryAddUsageDescription:
        // eslint-disable-next-line max-len
        "We requests permission to save photos and videos to your photo gallery. This allows you to store and manage media content created or edited within the app, like saving a photo you've just taken. Users can revoke this permission at any time in the settings.",
      NSPhotoLibraryUsageDescription:
        // eslint-disable-next-line max-len
        'We requests access to your photo gallery to select photos or videos for uploading. For example, you can choose an existing video from your gallery to post on your profile. Users can revoke this permission at any time in the settings.',
      NSLocationWhenInUseUsageDescription:
        // eslint-disable-next-line max-len
        'We requests access to your location while using the app to offer localized content and services. For example, we provide event recommendations or user connections based on your current location. Users can revoke this permission at any time in the settings.',
    },
  },
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_ANDROID,
    userInterfaceStyle: 'automatic',
    permissions: [
      'RECEIVE_BOOT_COMPLETED',
      'CAMERA',
      'CAMERA_ROLL',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'NOTIFICATIONS',
      'USER_FACING_NOTIFICATIONS',
      'SCHEDULE_EXACT_ALARM',
    ],
    package: 'com.crossplatformkorea.app',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: {
          scheme: 'https',
          host: DEEP_LINK_URL,
          pathPrefix: '/',
        },
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  description: 'Official Cross-Platform Korea community app',
  web: {bundler: 'metro', favicon: './assets/favicon.png'},
});

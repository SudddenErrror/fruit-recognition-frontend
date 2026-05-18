import 'dotenv/config';

export default () => ({
  expo: {
    name: 'Veggie Scan',
    slug: 'fruit-vision',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'ru.grapelab.veggiescan',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'ru.grapelab.veggiescan',
      //
      // edgeToEdgeEnabled: true,
      //
      // Эта настройка требует нативной сборки (development build / APK).
      // В Expo Go она игнорируется на уровне нативного кода, но вызывает
      // серый overlay от system navigation bar, который блокирует весь UI.
      // Подключить обратно можно после перехода на dev build.
      //
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
      ],
    },
    web: {
      favicon: './assets/images/favicon.png'
    },
    extra: {
      API_URL: process.env.API_URL ?? 'http://localhost:8000',
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
          microphonePermission: false,
          recordAudioAndroid: false,
          barcodeScannerEnabled: true
        }
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos so you can scan fruits from your library.',
          cameraPermission: false,
          microphonePermission: false,
          colors: {
            cropToolbarColor: '#000000'
          },
          dark: {
            colors: {
              cropToolbarColor: '#000000'
            }
          }
        }
      ],
    ],
  },
});

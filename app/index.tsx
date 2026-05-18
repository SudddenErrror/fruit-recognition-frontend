import api from '@/src/api/axios';
import { BottomControlPanel } from '@/src/components/BottomControlPanel';
import { PluInputModal } from '@/src/components/PluInputModal';
import { fruitData } from '@/src/store/fruitData';
import { LoadingOverlay } from '@/src/components/LoadingOverlay';
import { ScannerFrame } from '@/src/components/ScannerFrame';
import { TopControlPanel } from '@/src/components/TopControlPanel';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

// --- Main Screen Component ---
export default function CameraScreen() {
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState<'fruit' | 'plu'>('fruit');
  const [isPluModalVisible, setIsPluModalVisible] = useState(false);


  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);

  // Initial Permissions Check
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  if (!permission) {
    return <View />; // Loading state
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'white' }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permButton}>
          <Text style={{ color: 'black' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Logic Functions ---

  const handleToggleTorch = () => {
    setIsTorchOn(prev => !prev);
  };

  const handleOpenGallery = async () => {
    if (isProcessing) return;

    try {
      const { status, granted, canAskAgain } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!granted) {
        const message =
          status === 'denied' && canAskAgain === false
            ? 'Разрешите доступ к фото в настройках устройства.'
            : 'Нужен доступ к галерее, чтобы выбрать фото.';
        Alert.alert('Доступ к галерее', message);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setLoading(true);
      setIsProcessing(true);
      try {
        await sendToServer(asset.uri, {
          fileName: asset.fileName ?? undefined,
          mimeType: asset.mimeType ?? undefined,
        });
      } finally {
        setLoading(false);
        setIsProcessing(false);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть галерею или отправить фото.');
      console.error(error);
    }
  };

  const sendToServer = async (
    imageUri: string,
    meta?: { fileName?: string; mimeType?: string }
  ) => {
    console.log('Sending image to server:', imageUri);

    const formData = new FormData();

    const mimeType =
      meta?.mimeType ||
      (imageUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
    const name =
      meta?.fileName ||
      (mimeType === 'image/png' ? 'image.png' : 'image.jpg');

    formData.append('image', {
      uri: imageUri,
      name,
      type: mimeType,
    } as any);

    try {
      const result = await api.post('/inference/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (result.data.message === 'No objects detected')  {
        Toast.show({
          type: 'error',
          text1: 'No fruits detected',
        });
        return;
      }

      const slug = result.data.label;
      router.push(`/info?slug=${slug}`);
    } catch (error) {
      Alert.alert("Error", "Failed to send image to server.");
      console.error(error);
    }
  };

  const toggleMode = () => {
    setScanMode(prev => (prev === 'fruit' ? 'plu' : 'fruit'));
  };

  const handleTakePicture = async () => {
    if (scanMode === 'plu') {
      // Открываем модалку для ввода PLU
      setIsPluModalVisible(true);
      return;
    }

    // Существующая логика для режима фруктов
    setLoading(true);
    if (cameraRef.current) {
      try {
        await cameraRef.current.pausePreview();
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          await sendToServer(photo.uri);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to take picture.");
        console.error(error);
      } finally {
        setLoading(false);
        setIsProcessing(false);
        await cameraRef.current?.resumePreview();
      }
    }
  };

  const handlePluSubmit = async (pluCode: string) => {
    setLoading(true);
    setIsProcessing(true);
    try {
      // Ищем фрукт по PLU в локальной базе
      const fruit = fruitData.find(f => String(f.plu_code) === pluCode);
      if (fruit) {
        router.push(`/info?slug=${fruit.slug}`);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Фрукт с таким PLU не найден',
        });
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось найти фрукт по PLU');
      console.error(error);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleOpenMenu = () => {
    router.push('/menu');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topOpaqueBlock}>
        <TopControlPanel 
          isTorchOn={isTorchOn} 
          onToggleTorch={handleToggleTorch} 
          onOpenMenu={handleOpenMenu}
        />
      </View>

      <View style={styles.cameraContainer}>
        <View style={styles.cameraWrapper}>
          <CameraView 
            ref={cameraRef}
            style={styles.camera} 
            enableTorch={isTorchOn}
          >
            <ScannerFrame />
          </CameraView>
        </View>

        <BottomControlPanel 
          onTakePicture={handleTakePicture} 
          onOpenGallery={handleOpenGallery}
          isProcessing={isProcessing}
          scanMode={scanMode}
          onToggleMode={toggleMode}
        />
      </View>

      <LoadingOverlay visible={loading} text="Обработка..." />
      <PluInputModal
        visible={isPluModalVisible}
        onClose={() => setIsPluModalVisible(false)}
        onSubmit={handlePluSubmit}
      />
      <Toast />
    </View>
  );
}

// --- Styles ---
const { width } = Dimensions.get('window');
const FRAME_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permButton: {
    backgroundColor: 'white',
    padding: 10,
    marginTop: 20,
    borderRadius: 5
  },
  
  // Layout Structure
  topOpaqueBlock: {
    backgroundColor: 'black',
    zIndex: 10, // Ensure it sits on top
    // Note: Height is determined by SafeAreaView inside the component
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Top Panel Styles
  topPanelContainer: {
    backgroundColor: 'black',
  },
  topPanelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes items to edges
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  iconButton: {
    // padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },

  // QR Frame Styles
  qrFrameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  qrText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },

  // Bottom Panel Styles
  bottomPanelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150, // Height of the semi-transparent area
    backgroundColor: 'black', // Semi-transparent black
    justifyContent: 'center',
    paddingBottom: 20,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // iPhone-style Shutter Button
  shutterButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  
  emptySpacer: {
    width: 50, // Matches gallery button width to keep center button centered
  },
});
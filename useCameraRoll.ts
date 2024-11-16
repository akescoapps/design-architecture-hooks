import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useNotify } from 'rn-notify';

import { useTranslation } from '@app/hooks';

const SCOPE = 'hooks.useCameraRoll';

const useCameraRoll = () => {
  const { t } = useTranslation();
  const notify = useNotify();
  const [_, requestPermission] = MediaLibrary.usePermissions();

  const checkPermission = useCallback(async () => {
    const { granted, status } = await MediaLibrary.getPermissionsAsync();
    if (status === MediaLibrary.PermissionStatus.UNDETERMINED) {
      requestPermission();
      return false;
    }

    if (status === MediaLibrary.PermissionStatus.DENIED) {
      Alert.alert(t('alert.title', SCOPE), t('alert.description', SCOPE), [
        {
          text: t('alert.deny', SCOPE),
          style: 'destructive',
        },
        {
          text: t('alert.allow', SCOPE),
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]);
      return false;
    }

    return granted;
  }, []);

  const imageToBase64 = useCallback(async (url?: string) => {
    const tempFile =
      FileSystem.cacheDirectory + `image_${Crypto.randomUUID()}.jpeg`;

    const { uri } = await FileSystem.downloadAsync(String(url), tempFile);
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    return `data:image/png;base64, ${base64}`;
  }, []);

  const saveAssetFromWatermark = useCallback(async (imageUrl: string) => {
    const granted = await checkPermission();
    if (!granted) {
      return;
    }
    notify.info({
      message: t('downloadingPhotos', 'toast'),
      duration: 3000,
    });

    const tempFile =
      FileSystem.cacheDirectory + `image_${Crypto.randomUUID()}.jpeg`;
    await FileSystem.writeAsStringAsync(tempFile, imageUrl, {
      encoding: FileSystem.EncodingType.Base64,
    });
    //* If returned value is null equal to = true
    await MediaLibrary.saveToLibraryAsync(tempFile);
    return true;
  }, []);
  const saveImageToLibrary = useCallback(async (imageUrl: string) => {
    const granted = await checkPermission();
    if (!granted) {
      return;
    }
    notify.info({
      message: t('downloadingPhotos', 'toast'),
      duration: 3000,
    });
    const tempFile =
      FileSystem.cacheDirectory + `image_${Crypto.randomUUID()}.jpeg`;

    const { uri } = await FileSystem.downloadAsync(imageUrl, tempFile);
    if (!uri) {
      return;
    }
    await MediaLibrary.saveToLibraryAsync(tempFile);
    return true;
  }, []);

  return { saveImageToLibrary, saveAssetFromWatermark, imageToBase64 };
};

export default useCameraRoll;

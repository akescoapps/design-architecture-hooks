import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import useTranslation from './useTranslation';

const SCOPE = 'hooks.useImagePicker';

export default function useImagePicker() {
  const { t } = useTranslation();
  const [, cameraPermission] = ImagePicker.useCameraPermissions();
  const [, mediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  const onImagePicker = useCallback(
    async (options?: ImagePicker.ImagePickerOptions | undefined) => {
      const granted = await checkMediaPermission();
      if (!granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 1,
        ...options,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
    },
    [],
  );
  const onCamera = useCallback(
    async (options?: ImagePicker.ImagePickerOptions | undefined) => {
      const granted = await checkCameraPermission();
      if (!granted) {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        ...options,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
    },
    [],
  );

  const checkCameraPermission = useCallback(async () => {
    const { granted, status } = await ImagePicker.getCameraPermissionsAsync();
    if (status === ImagePicker.PermissionStatus.UNDETERMINED) {
      const { granted: cameraPermissionResponse } = await cameraPermission();
      return cameraPermissionResponse;
    }

    if (status === ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        t('alert.camera.title', SCOPE),
        t('alert.camera.description', SCOPE),
        [
          {
            text: t('alert.camera.deny', SCOPE),
            style: 'destructive',
          },
          {
            text: t('alert.camera.allow', SCOPE),
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
      return false;
    }

    return granted;
  }, []);
  const checkMediaPermission = useCallback(async () => {
    const { granted, status } =
      await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status === ImagePicker.PermissionStatus.UNDETERMINED) {
      const { granted: mediaPermissionResponse } =
        await mediaLibraryPermission();
      return mediaPermissionResponse;
    }

    if (status === ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        t('alert.mediaLibrary.title', SCOPE),
        t('alert.mediaLibrary.description', SCOPE),
        [
          {
            text: t('alert.mediaLibrary.deny', SCOPE),
            style: 'destructive',
          },
          {
            text: t('alert.mediaLibrary.allow', SCOPE),
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
      return false;
    }

    return granted;
  }, []);

  return {
    onImagePicker,
    onCamera,
  };
}

import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

import useTranslation from './useTranslation';

const SCOPE = 'hooks.useGeolocation';

export default function useGeolocation() {
  const { t } = useTranslation();
  const [, locationPermission] = Location.useForegroundPermissions();

  const onForeground = useCallback(async () => {
    const granted = await checkForegroundPermission();
    if (!granted) {
      return;
    }

    return await Location.getCurrentPositionAsync({});
  }, []);

  const checkForegroundPermission = useCallback(async () => {
    const { granted, status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.UNDETERMINED) {
      const { granted: locationPermissionResponse } =
        await locationPermission();
      return locationPermissionResponse;
    }

    if (status === Location.PermissionStatus.DENIED) {
      Alert.alert(t('alert.title', SCOPE), t('alert.description', SCOPE), [
        {
          text: t('alert.deny', SCOPE),
          style: 'destructive',
        },
        {
          text: t('alert.allow', SCOPE),
          onPress: () => {
            void Linking.openSettings();
          },
        },
      ]);
      return false;
    }

    return granted;
  }, []);

  return {
    onForeground,
  };
}

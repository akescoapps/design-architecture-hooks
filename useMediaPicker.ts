import { useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

import { useMediaLibraryStore } from '@app/store';

import useTranslation from './useTranslation';

const SCOPE = 'hooks.useImagePicker';

export default function useMediaPicker() {
  const { t } = useTranslation();
  const { setAssets } = useMediaLibraryStore();
  const [, galleryPermission] = MediaLibrary.usePermissions();

  const onMediaLibrary = useCallback(async () => {
    const granted = await checkMediaLibraryPermission();
    if (!granted) {
      return;
    }
    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    const recentAlbum = fetchedAlbums?.find((album) => {
      return album.title === 'Recents';
    });

    const albumAssets = await MediaLibrary.getAssetsAsync({
      album: recentAlbum,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [MediaLibrary.SortBy.creationTime],
      first: 20,
      after: undefined,
    });

    const albumInfoAssets = await Promise.all(
      albumAssets.assets.map(async (asset) => {
        const info = await MediaLibrary.getAssetInfoAsync(asset);
        return info;
      }),
    );

    setAssets(albumInfoAssets);
  }, []);

  const checkMediaLibraryPermission = useCallback(async () => {
    const { granted, status } = await MediaLibrary.getPermissionsAsync();
    if (status === MediaLibrary.PermissionStatus.UNDETERMINED) {
      const { granted: mediaPermissionResponse } = await galleryPermission();
      return mediaPermissionResponse;
    }

    if (status === MediaLibrary.PermissionStatus.DENIED) {
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

  useEffect(() => {
    MediaLibrary.addListener(() => {
      void onMediaLibrary();
    });

    return () => MediaLibrary.removeAllListeners();
  }, []);

  return {
    onMediaLibrary,
  };
}

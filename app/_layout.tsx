import {useEffect, useState} from 'react';
import type {ColorSchemeName} from 'react-native';
import {Platform, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {dark, light} from '@dooboo-ui/theme';
import styled, {css} from '@emotion/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon, useDooboo} from 'dooboo-ui';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {Stack, useRouter} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {useSetRecoilState} from 'recoil';

import RootProvider from '../src/providers';
import {authRecoilState} from '../src/recoil/atoms';
import {t} from '../src/STRINGS';
import {supabase} from '../src/supabase';
import {
  AsyncStorageKey,
  COMPONENT_WIDTH,
  delayPressIn,
  WEB_URL,
} from '../src/utils/constants';

SplashScreen.preventAutoHideAsync();

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.brand};
`;

const Content = styled.View`
  align-self: center;
  width: 100%;
  flex: 1;
  max-width: ${COMPONENT_WIDTH + 'px'};
  background-color: ${({theme}) => theme.brand};
`;

function Layout(): JSX.Element | null {
  const {assetLoaded, snackbar, theme} = useDooboo();
  const {back, replace} = useRouter();
  const setAuth = useSetRecoilState(authRecoilState);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const {status} = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            // AuthType
            provider: session.user.app_metadata.provider as any,
            provider_id: session.user.app_metadata.provider_id,
            last_sign_in_at: session.user.app_metadata.last_sign_in_at,
            full_name: session.user.user_metadata.full_name,
            name: session.user.user_metadata.name,
            sub: session.user.user_metadata.sub,
            email: session.user.email,
            email_confirmed_at: session.user.email_confirmed_at,
            birthday: session.user.user_metadata.birthday,
            confirmed_at: session.user.user_metadata.confirmed_at,
            avatar_url: session.user.user_metadata.avatar_url,
            description: session.user.user_metadata.description,
            phone_number: session.user.user_metadata.phone_number,
            phone: session.user.user_metadata.phone,
            phone_verified: session.user.user_metadata.phone_verified,
          })
          .single();

        if (status !== 201 && status !== 200) {
          await supabase.auth.signOut();

          return;
        }

        const {data} = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) {
          if (data?.deleted_at) {
            await supabase.auth.signOut();
            snackbar.open({
              text: t('common.deletedAccount'),
              color: 'danger',
            });

            return;
          }

          setAuth({
            authId: session.user.id,
            user: data,
          });
        }

        return;
      }

      setAuth({
        authId: null,
        user: null,
      });
    });
  }, [setAuth, snackbar]);

  useEffect(() => {
    if (assetLoaded) {
      // Adhoc: Set a timeout to hide the splash screen
      const timeout = setTimeout(() => {
        SplashScreen.hideAsync();
        if (timeout) {
          clearTimeout(timeout);
        }
      }, 1000);
    }
  }, [assetLoaded]);

  return (
    <Container>
      <Content>
        <Stack
          screenOptions={{
            headerStyle: {backgroundColor: theme.bg.basic},
            headerTintColor: theme.text.label,
            headerTitleStyle: {
              fontWeight: 'bold',
              color: theme.text.basic,
            },
            headerLeft: ({canGoBack}) =>
              canGoBack && (
                <CustomPressable
                  delayHoverIn={delayPressIn}
                  hitSlop={{top: 8, left: 8, right: 8, bottom: 8}}
                  onPress={() =>
                    canGoBack
                      ? back()
                      : Platform.OS === 'web'
                        ? (window.location.href = WEB_URL)
                        : replace('/')
                  }
                  style={
                    Platform.OS === 'web'
                      ? css`
                          padding: 8px;
                          border-radius: 48px;
                        `
                      : css`
                          padding: 8px;
                          border-radius: 48px;
                          margin-left: -8px;
                        `
                  }
                >
                  <Icon name="CaretLeft" size={24} />
                </CustomPressable>
              ),
          }}
        >
          <Stack.Screen name="(app)/(tabs)" options={{headerShown: false}} />
          {/* Note: Only modals are written here.  */}
        </Stack>
      </Content>
    </Container>
  );
}

export default function RootLayout(): JSX.Element | null {
  const colorScheme = useColorScheme();
  const [localThemeType, setLocalThemeType] = useState<string | undefined>(
    undefined,
  );

  // 테마 불러오기
  useEffect(() => {
    const initializeThemeType = async (): Promise<void> => {
      const darkMode = await AsyncStorage.getItem(AsyncStorageKey.DarkMode);

      const isDarkMode = !darkMode
        ? colorScheme === 'dark'
        : darkMode === 'true';

      SystemUI.setBackgroundColorAsync(
        isDarkMode ? dark.bg.basic : light.bg.basic,
      );

      setLocalThemeType(isDarkMode ? 'dark' : 'light');
    };

    initializeThemeType();
  }, [colorScheme]);

  if (!localThemeType) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={css`
        flex: 1;
      `}
    >
      <RootProvider initialThemeType={localThemeType as ColorSchemeName}>
        <>
          <StatusBarBrightness />
          <Layout />
        </>
      </RootProvider>
    </GestureHandlerRootView>
  );
}

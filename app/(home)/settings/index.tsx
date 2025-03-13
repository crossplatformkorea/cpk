import {Fragment, useEffect, useMemo, useState} from 'react';
import {Platform, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {css} from '@emotion/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import {Stack, useRouter} from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import {useRecoilValue} from 'recoil';

import {authRecoilState} from '../../../src/recoil/atoms';
import {t} from '../../../src/STRINGS';
import {AsyncStorageKey} from '../../../src/utils/constants';
import CustomLoadingIndicator from '../../../src/components/uis/CustomLoadingIndicator';
import useAppState from '../../../src/hooks/useAppState';
import {openEmail} from '../../../src/utils/common';
import ErrorBoundary from 'react-native-error-boundary';
import FallbackComponent from '../../../src/components/uis/FallbackComponent';
import {CustomPressable, Icon, SwitchToggle, Typography, useCPK} from 'cpk-ui';
import { dark, light } from 'cpk-ui/utils/colors';

const Container = styled.View`
  background-color: ${({theme}) => theme.bg.basic};

  flex: 1;
  align-self: stretch;
`;

const SettingButton = styled(CustomPressable)`
  padding: 24px 16px;

  flex-direction: row;
  align-items: center;
`;

const Divider = styled.View`
  border-width: 0.5px;
  border-color: ${({theme}) => theme.role.border};
  margin-left: 56px;
`;

export default function Settings(): JSX.Element {
  const {push} = useRouter();
  const {theme, changeThemeType, themeType} = useCPK();
  const authId = useRecoilValue(authRecoilState);
  const {bottom} = useSafeAreaInsets();

  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);

  const checkNotificationPermission = async (): Promise<void> => {
    const {status} = await Notifications.getPermissionsAsync();
    setHasNotificationPermission(status === 'granted');
  };

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  useAppState((state) => {
    if (state === 'active') {
      const timeout = setTimeout(async () => {
        await checkNotificationPermission();
        clearTimeout(timeout);
      }, 100);
    }
  });

  type Menu = {
    onPress?: () => void;
    title: string;
    startElement: JSX.Element;
    endElement?: JSX.Element;
  };

  const menus = useMemo<Menu[]>(
    () => [
      {
        onPress: () => push('/settings/login-info'),
        startElement: (
          <Icon
            name="Users"
            size={24}
            style={css`
              margin-right: 16px;
            `}
          />
        ),
        endElement: (
          <Icon
            name="CaretRight"
            size={16}
            style={css`
              margin-left: auto;
            `}
          />
        ),
        title: t('settings.loginInfo'),
      },
      {
        onPress: () => push('/settings/profile-update'),
        startElement: (
          <Icon
            name="NotePencil"
            size={24}
            style={css`
              margin-right: 16px;
            `}
          />
        ),
        endElement: (
          <Icon
            name="CaretRight"
            size={16}
            style={css`
              margin-left: auto;
            `}
          />
        ),
        title: t('settings.updateProfile'),
      },
      {
        onPress: () => {
          if (Platform.OS !== 'web') {
            push('/settings/points');
            return;
          }

          // showAlert(t('error.notSupportedInWeb'));
        },
        startElement: (
          <Icon
            name="Coins"
            size={24}
            style={css`
              margin-right: 16px;
            `}
          />
        ),
        endElement: (
          <Icon
            name="CaretRight"
            size={16}
            style={css`
              margin-left: auto;
            `}
          />
        ),
        title: t('settings.points'),
      },
      {
        onPress: () => push('/settings/block-users'),
        startElement: (
          <Icon
            name="ProhibitInset"
            size={24}
            style={css`
              margin-right: 16px;
            `}
          />
        ),
        endElement: (
          <Icon
            name="CaretRight"
            size={16}
            style={css`
              margin-left: auto;
            `}
          />
        ),
        title: t('settings.blockedUsers'),
      },
      {
        startElement: (
          <Icon
            name="StarAndCrescent"
            size={24}
            style={css`
              margin-right: 16px;
            `}
          />
        ),
        endElement: (
          <SwitchToggle
            isOn={themeType === 'dark'}
            onPress={() => {
              AsyncStorage.setItem(
                AsyncStorageKey.DarkMode,
                JSON.stringify(themeType !== 'dark'),
              );

              const isDarkMode = themeType === 'dark';

              SystemUI.setBackgroundColorAsync(
                isDarkMode ? light.bg.basic : dark.bg.basic,
              );

              changeThemeType(isDarkMode ? 'light' : 'dark');
            }}
            style={[
              css`
                margin-left: auto;
              `,
              {transform: [{scaleX: 0.9}, {scaleY: 0.9}]},
            ]}
          />
        ),
        title: t('settings.darkMode'),
        onPress: undefined,
      },
      {
        startElement: (
          <Icon
            name="BellRinging"
            size={24}
            style={css`
              margin-right: 16px;
            `}
          />
        ),
        endElement: (
          <SwitchToggle
            isOn={hasNotificationPermission}
            onPress={() => {
              Linking.openSettings();
            }}
            style={{
              marginLeft: 'auto',
              transform: [{scaleX: 0.9}, {scaleY: 0.9}],
            }}
          />
        ),
        title: t('settings.notificationSettings'),
        onPress: undefined,
      },
      {
        onPress: () => push('/termsofservice'),
        startElement: (
          <Icon
            name="Files"
            size={24}
            style={css`
              margin-right: 16px;
            `}
          />
        ),
        endElement: (
          <Icon
            name="OpenInNew"
            size={16}
            style={css`
              margin-left: auto;
            `}
          />
        ),
        title: t('settings.termsOfService'),
      },
    ],
    [hasNotificationPermission, themeType, changeThemeType, push],
  );

  if (!authId) {
    return (
      <>
        <Stack.Screen options={{title: t('settings.title')}} />
        <CustomLoadingIndicator />
      </>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Stack.Screen options={{title: t('settings.title'), headerShown: true}} />
      <Container>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          <SettingButton
            onPress={openEmail}
            style={css`
              background-color: ${theme.role.primary};
            `}
          >
            <>
              <Icon
                color={theme.button.primary.text}
                name="AutoAwesome"
                size={24}
                style={css`
                  margin-right: 16px;
                `}
              />
              <Typography.Body2
                style={css`
                  font-family: Pretendard-Bold;
                  color: ${theme.button.primary.text};
                `}
              >
                {t('common.contactUs')}
              </Typography.Body2>
              <Icon
                color={theme.button.primary.text}
                name="OpenInNew"
                size={16}
                style={css`
                  margin-left: auto;
                `}
              />
            </>
          </SettingButton>
          {menus.map((menu) => (
            <Fragment key={menu.title}>
              {!menu.onPress ? (
                <View
                  style={css`
                    padding: 24px 16px;

                    flex-direction: row;
                    align-items: center;
                  `}
                >
                  {menu.startElement}
                  <Typography.Body2>{menu.title}</Typography.Body2>
                  {menu.endElement}
                </View>
              ) : (
                <SettingButton
                  disabled={!menu.onPress}
                  onPress={menu.onPress}
                  unstable_pressDelay={100}
                >
                  <>
                    {menu.startElement}
                    <Typography.Body2>{menu.title}</Typography.Body2>
                    {menu.endElement}
                  </>
                </SettingButton>
              )}
              <Divider />
            </Fragment>
          ))}
          <View
            style={css`
              height: ${bottom + 'px'};
            `}
          />
        </ScrollView>
      </Container>
    </ErrorBoundary>
  );
}

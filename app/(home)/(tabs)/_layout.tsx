import {View} from 'react-native';
import {Redirect, Tabs, useRouter} from 'expo-router';
import {t} from '../../../src/STRINGS';
import {useEffect, useRef} from 'react';
import * as Notifications from 'expo-notifications';
import {RectButton} from 'react-native-gesture-handler';
import {css} from '@emotion/native';
import {Image} from 'expo-image';
import {IC_ICON} from '../../../src/icons';
import {useRecoilValue} from 'recoil';
import {authRecoilSelector} from '../../../src/recoil/selectors';
import {Icon, useCPK} from 'cpk-ui';

function SettingsMenu(): JSX.Element {
  const {theme} = useCPK();
  const {push} = useRouter();

  return (
    <RectButton
      onPress={() => push('/settings')}
      style={css`
        align-items: center;
        justify-content: center;
        padding: 2px;
        border-radius: 99px;
        margin-right: 8px;
      `}
    >
      <Icon color={theme.text.basic} name="List" size={22} />
    </RectButton>
  );
}

export default function TabLayout(): JSX.Element {
  const {theme} = useCPK();
  const notificationResponseListener =
    useRef<Notifications.EventSubscription>();
  const {user} = useRecoilValue(authRecoilSelector);

  useEffect(() => {
    if (!user?.id) return;

    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(JSON.stringify(response.notification.request));
      });

    return () => {
      notificationResponseListener.current &&
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current,
        );
    };
  }, [user?.id]);

  if (!user?.display_name) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: theme.role.primary,
        headerStyle: {backgroundColor: theme.bg.basic},
        headerTitleStyle: {color: theme.text.basic},
        tabBarStyle: {backgroundColor: theme.bg.basic},
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.community'),
          tabBarIcon: ({color}) => (
            <Icon color={color} name="Article" size={24} />
          ),
          headerRight: () => <View>{SettingsMenu()}</View>,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: t('common.my'),
          tabBarIcon: ({focused}) => (
            <View
              style={css`
                width: 24px;
                height: 24px;
                border-radius: 12px;
                background-color: ${theme.bg.paper};
                overflow: hidden;
              `}
            >
              <Image
                source={
                  user && user?.avatar_url ? {uri: user.avatar_url} : IC_ICON
                }
                style={css`
                  width: 24px;
                  height: 24px;
                  opacity: ${focused ? '1' : '0.5'};
                `}
              />
            </View>
          ),
          headerRight: () => <View>{SettingsMenu()}</View>,
        }}
      />
    </Tabs>
  );
}

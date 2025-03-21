import styled from '@emotion/native';
import {Stack} from 'expo-router';
import {t} from '../../../src/STRINGS';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../../src/recoil/atoms';
import CustomScrollView from '../../../src/components/uis/CustomScrollView';
import {css} from '@emotion/native';
import {Pressable} from 'react-native';
import {IC_ICON} from '../../../src/icons';
import {openURL} from '../../../src/utils/common';
import DoobooStats from '../../../src/components/fragments/DoobooStats';
import ErrorBoundary from 'react-native-error-boundary';
import FallbackComponent from '../../../src/components/uis/FallbackComponent';
import {Image} from 'expo-image';
import {authRecoilSelector} from '../../../src/recoil/selectors';
import {Icon, Typography, useCPK} from 'cpk-ui';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const ProfileHeader = styled.View`
  align-items: center;
  padding: 24px;
  background-color: ${({theme}) => theme.bg.paper};
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
`;

const Content = styled.View`
  padding: 16px;
`;

const UserAvatar = styled(Image)`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  margin-bottom: 16px;
  border-width: 3px;
  border-color: ${({theme}) => theme.role.border};
`;

const UserName = styled(Typography.Heading5)`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const UserAffiliation = styled.Text`
  font-size: 16px;
  color: ${({theme}) => theme.role.secondary};
  text-align: center;
  margin-bottom: 16px;
`;

const UserBio = styled.Text`
  font-size: 16px;
  color: ${({theme}) => theme.text.label};
  text-align: center;
  margin-bottom: 16px;
`;

const InfoCard = styled.View`
  background-color: ${({theme}) => theme.bg.paper};
  border-radius: 15px;
  padding: 16px 16px 24px 16px;
  margin-bottom: 16px;

  gap: 16px;
`;

const InfoItem = styled.View`
  gap: 4px;
`;

const InfoLabel = styled(Typography.Body2)`
  color: ${({theme}) => theme.text.label};
  font-family: Pretendard-Bold;
`;

const InfoValue = styled(Typography.Body2)``;

const TagContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const Tag = styled.View`
  background-color: ${({theme}) => theme.role.link};
  border-radius: 20px;
  padding: 6px 12px;
  margin-right: 8px;
  margin-bottom: 4px;
`;

const TagText = styled.Text`
  color: ${({theme}) => theme.text.contrast};
  font-size: 14px;
`;

export default function My(): JSX.Element {
  const {tags} = useRecoilValue(authRecoilState);
  const {user} = useRecoilValue(authRecoilSelector);
  const {theme} = useCPK();

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Stack.Screen options={{title: t('common.my')}} />
      <Container>
        <CustomScrollView bounces={false}>
          <ProfileHeader>
            <UserAvatar
              style={css`
                opacity: ${user?.avatar_url ? '1' : '0.7'};
              `}
              source={user?.avatar_url ? {uri: user?.avatar_url} : IC_ICON}
            />
            <UserName>{user?.display_name || ''}</UserName>
            {user?.affiliation ? (
              <UserAffiliation>{user?.affiliation}</UserAffiliation>
            ) : null}
            {user?.introduction ? (
              <UserBio>{user?.introduction}</UserBio>
            ) : null}
          </ProfileHeader>
          <Content>
            <InfoCard
              style={{
                shadowColor: theme.role.underlayContrast,
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <InfoItem>
                <InfoLabel>{t('onboarding.githubId')}</InfoLabel>
                <Pressable
                  onPress={() =>
                    user?.github_id &&
                    openURL(`https://github.com/${user.github_id}`)
                  }
                  style={css`
                    flex-direction: row;
                    align-items: center;
                    gap: 4px;
                  `}
                >
                  <Icon name="GithubLogo" size={16} color={theme.role.link} />
                  <InfoValue>{user?.github_id || ''}</InfoValue>
                </Pressable>
                <DoobooStats user={user} />
              </InfoItem>
            </InfoCard>

            {user?.desired_connection || user?.future_expectations ? (
              <InfoCard>
                {user?.desired_connection ? (
                  <InfoItem>
                    <InfoLabel>{t('onboarding.desiredConnection')}</InfoLabel>
                    <InfoValue>{user?.desired_connection || ''}</InfoValue>
                  </InfoItem>
                ) : null}
                {user?.future_expectations ? (
                  <InfoItem>
                    <InfoLabel>{t('onboarding.futureExpectations')}</InfoLabel>
                    <InfoValue>{user?.future_expectations || ''}</InfoValue>
                  </InfoItem>
                ) : null}
              </InfoCard>
            ) : null}

            {tags?.length ? (
              <InfoCard>
                <InfoLabel>{t('onboarding.userTags')}</InfoLabel>
                <TagContainer>
                  {tags.map((tag, index) => (
                    <Tag key={index}>
                      <TagText>{tag}</TagText>
                    </Tag>
                  ))}
                </TagContainer>
              </InfoCard>
            ) : null}
          </Content>
        </CustomScrollView>
      </Container>
    </ErrorBoundary>
  );
}

import styled, {css} from '@emotion/native';
import type {Image, Post, User} from '../../types';
import {formatDateTime} from '../../utils/date';
import UserListItem from './UserListItem';
import {TouchableOpacity, View} from 'react-native';
import ControlItem, {ControlItemProps} from './ControlItem';
import {Image as ExpoImage} from 'expo-image';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../recoil/atoms';
import {isYoutubeURL} from '../../utils/urlParser';
import {Hr, Icon, Typography, useCPK} from 'cpk-ui';

const Container = styled.View`
  background-color: ${({theme}) => theme.bg.basic};
  gap: 8px;
`;

const Content = styled.View`
  padding: 16px 24px;
  margin-bottom: -4px;
  gap: 8px;
`;

type Props = {
  post: Post & {user: User; images: Image[]};
  onPress?: () => void;
  controlItemProps?: ControlItemProps;
};

export default function PostListItem({
  post,
  onPress,
  controlItemProps,
}: Props): JSX.Element | null {
  const {theme} = useCPK();
  const {blockedUserIds} = useRecoilValue(authRecoilState);

  if (blockedUserIds.includes(post.user_id)) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Container>
        <Content>
          <View
            style={css`
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              gap: 8px;
            `}
          >
            <View
              style={css`
                flex: 1;
                gap: 8px;
              `}
            >
              <View
                style={css`
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                `}
              >
                <Typography.Body2
                  style={css`
                    flex: 1;
                    padding-right: 8px;
                    font-family: Pretendard-Bold;
                  `}
                >
                  {post.title}
                </Typography.Body2>
                {post?.url && isYoutubeURL(post.url) ? (
                  <Icon name="YoutubeLogo" size={22} />
                ) : null}
              </View>
              <Typography.Body3 numberOfLines={4}>
                {post.content}
              </Typography.Body3>
            </View>
            {post.images?.[0]?.image_url ? (
              <ExpoImage
                source={{
                  uri: post.images?.[0]?.image_url as string,
                }}
                style={css`
                  width: 80px;
                  height: 80px;
                  border-radius: 8px;
                `}
              />
            ) : null}
          </View>
          <UserListItem user={post.user} />
          <Hr />
          <View
            style={css`
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
            `}
          >
            <ControlItem {...controlItemProps} />
            <Typography.Body4
              style={css`
                color: ${theme.text.placeholder};
              `}
            >
              {formatDateTime(post.created_at!)}
            </Typography.Body4>
          </View>
        </Content>
        <Hr />
      </Container>
    </TouchableOpacity>
  );
}

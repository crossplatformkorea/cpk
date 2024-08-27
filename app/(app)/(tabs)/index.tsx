import styled, {css} from '@emotion/native';
import {Fab, LoadingIndicator} from 'dooboo-ui';
import {FlashList} from '@shopify/flash-list';
import {useRouter} from 'expo-router';
import PostListItem from '../../../src/components/uis/PostListItem';
import {useCallback, useState} from 'react';
import {fetchPostPagination} from '../../../src/apis/postQueries';
import useSWR from 'swr';
import FallbackComponent from '../../../src/components/uis/FallbackComponent';
import CustomLoadingIndicator from '../../../src/components/uis/CustomLoadingIndicator';
import {addPostsIfNotExists} from '../../../src/recoil/atoms';
import ListEmptyItem from '../../../src/components/uis/ListEmptyItem';
import ErrorBoundary from 'react-native-error-boundary';
import {useAuthStore} from '../../../src/stores/authStore';
import {usePostsStore} from '../../../src/stores/postStore';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function Posts(): JSX.Element {
  const {push} = useRouter();
  const {authId, blockedUserIds} = useAuthStore();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const {posts, setPosts} = usePostsStore();
  const [loadingMore, setLoadingMore] = useState(false);

  const fetcher = useCallback(
    (cursor: string | undefined) =>
      fetchPostPagination({cursor, blockedUserIds}),
    [blockedUserIds],
  );

  const {error, isValidating, mutate} = useSWR(
    ['posts', cursor],
    () => fetchPostPagination({cursor, blockedUserIds}),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        let newPosts = posts;
        if (!cursor) {
          newPosts = addPostsIfNotExists(posts, data);
        } else {
          newPosts = addPostsIfNotExists(posts, data);
        }

        setPosts(newPosts);
        setLoadingMore(false);
        if (newPosts.length > 0) {
          setCursor(newPosts[newPosts.length - 1].created_at || undefined);
        }
      },
    },
  );

  const loadMore = () => {
    if (!loadingMore) {
      setLoadingMore(true);
      fetcher(cursor).then((newPosts) => {
        setPosts(addPostsIfNotExists(posts, newPosts));
        setLoadingMore(false);
      });
    }
  };

  const handleRefresh = () => {
    setCursor(undefined);
    mutate();
  };

  const content = (() => {
    switch (true) {
      case !!error:
        return <FallbackComponent />;
      case isValidating:
        return <CustomLoadingIndicator />;
      default:
        return (
          <FlashList
            data={posts}
            onRefresh={handleRefresh}
            refreshing={isValidating && cursor === null}
            renderItem={({item}) => (
              <PostListItem
                post={item}
                controlItemProps={{
                  hasLiked: item.likes?.some(
                    (like) => like.user_id === authId && like.liked,
                  ),
                  likeCnt: item.likes?.length || 0,
                  replyCnt: item.replies?.length || 0,
                }}
                onPress={() => {
                  push({
                    pathname: '/post/[id]',
                    params: {id: item.id},
                  });
                }}
              />
            )}
            ListEmptyComponent={<ListEmptyItem />}
            estimatedItemSize={208}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <LoadingIndicator
                  style={css`
                    padding: 24px;
                  `}
                />
              ) : null
            }
          />
        );
    }
  })();

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Container>
        {content}
        <Fab
          animationDuration={300}
          fabIcon="Plus"
          onPressFab={() => {
            push('/post/write');
          }}
          style={css`
            bottom: 16px;
          `}
        />
      </Container>
    </ErrorBoundary>
  );
}

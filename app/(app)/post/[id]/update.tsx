import styled, {css} from '@emotion/native';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import {EditText, Typography, useDooboo} from 'dooboo-ui';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import ErrorFallback from '../../../../src/components/uis/ErrorFallback';
import {useRecoilValue} from 'recoil';
import {
  getPublicUrlFromPath,
  uploadFileToSupabase,
} from '../../../../src/supabase';
import {authRecoilState} from '../../../../src/recoil/atoms';
import {t} from '../../../../src/STRINGS';
import useSWR from 'swr';
import {fetchPostById, fetchUpdatePost} from '../../../../src/apis/postQueries';
import CustomLoadingIndicator from '../../../../src/components/uis/CustomLoadingIndicator';
import NotFound from '../../../../src/components/uis/NotFound';
import {useState} from 'react';
import {ImagePickerAsset} from 'expo-image-picker';
import MultiUploadImageInput from '../../../../src/components/uis/MultiUploadImageInput';
import {MAX_IMAGES_UPLOAD_LENGTH} from '../../../../src/utils/constants';
import CustomScrollView from '../../../../src/components/uis/CustomScrollView';
import {filterUploadableAssets} from '../../../../src/utils/common';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const Content = styled.View`
  flex: 1;

  gap: 16px;
`;

const schema = yup.object().shape({
  title: yup.string().required(t('post.write.titlePlaceholder')),
  content: yup.string().required(t('post.write.contentPlaceholder')),
  url: yup.string().url(t('common.invalidUrl')),
});

type FormData = yup.InferType<typeof schema>;

export default function PostUpdate(): JSX.Element {
  const {id} = useLocalSearchParams<{id: string}>();
  const {back} = useRouter();
  const {theme, snackbar} = useDooboo();
  const {authId} = useRecoilValue(authRecoilState);
  const [assets, setAssets] = useState<ImagePickerAsset[]>([]);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const {
    data: post,
    error,
    isValidating,
  } = useSWR(id ? `post-${id}` : null, () => fetchPostById(id || ''), {
    onSuccess: (data) => {
      if (data) {
        reset({
          title: data.title,
          content: data.content,
          url: data?.url || undefined,
        });
        setAssets(
          (data.images || []).map((el) => ({
            uri: el.image_url as string,
            type: 'image',
            height: el.height || 0,
            width: el.width || 0,
          })),
        );
      }
    },
  });

  const handleUpdatePost: SubmitHandler<FormData> = async (data) => {
    if (!authId || !id) return;

    try {
      const imageUploadPromises = filterUploadableAssets(assets).map(
        async (asset) => {
          const destPath = `${asset.type === 'video' ? 'videos' : 'images'}/${Date.now()}_${asset.fileName}`;
          const file = asset.uri;

          return await uploadFileToSupabase({
            uri: file,
            fileType: asset.type === 'video' ? 'Video' : 'Image',
            bucket: 'images',
            destPath,
          });
        },
      );

      const images = await Promise.all(imageUploadPromises);

      const initialImageUrls =
        post?.images?.map((el) => el?.image_url as string) || [];

      const imageUris = assets.map((el) => el.uri);

      const deleteImageUrls = initialImageUrls.filter(
        (element) => !imageUris.includes(element) && element.startsWith('http'),
      );

      await fetchUpdatePost({
        postId: id,
        title: data.title,
        content: data.content,
        url: data.url || null,
        images: images
          .filter((el) => !!el)
          .map((el) => ({
            ...el,
            image_url: el?.image_url
              ? getPublicUrlFromPath(el.image_url)
              : undefined,
          })),
        imageUrlsToDelete: deleteImageUrls,
      });

      snackbar.open({
        text: t('post.update.updateSuccess'),
        color: 'success',
      });

      back();
    } catch (e) {
      snackbar.open({
        text: t('post.update.updateFailed'),
        color: 'danger',
      });

      if (__DEV__) console.error('Error updating post:', e);
    }
  };

  const content = (() => {
    switch (true) {
      case isValidating:
        return <CustomLoadingIndicator />;
      case error:
        return <ErrorFallback />;
      case !post:
        return <NotFound />;
      case !!post:
        return (
          <KeyboardAvoidingView
            behavior={Platform.select({ios: 'padding', default: undefined})}
            keyboardVerticalOffset={Platform.select({ios: 116, default: 88})}
            style={css`
              background-color: ${theme.bg.basic};
            `}
          >
            <CustomScrollView
              bounces={false}
              style={css`
                padding: 24px;
              `}
            >
              <Content>
                <Controller
                  control={control}
                  name="title"
                  render={({field: {onChange, value}}) => (
                    <EditText
                      styles={{
                        label: css`
                          font-size: 14px;
                          margin-bottom: -4px;
                        `,
                      }}
                      colors={{focused: theme.role.primary}}
                      label={t('post.write.title')}
                      onChangeText={onChange}
                      placeholder={t('post.write.titlePlaceholder')}
                      value={value}
                      decoration="boxed"
                      error={errors.title ? errors.title.message : ''}
                    />
                  )}
                  rules={{required: true, validate: (value) => !!value}}
                />
                <Controller
                  control={control}
                  name="content"
                  render={({field: {onChange, value}}) => (
                    <EditText
                      styles={{
                        label: css`
                          font-size: 14px;
                          margin-bottom: -4px;
                        `,
                        input: css`
                          min-height: 320px;
                          max-height: 440px;
                        `,
                      }}
                      multiline
                      numberOfLines={10}
                      colors={{focused: theme.role.primary}}
                      label={t('post.write.content')}
                      onChangeText={onChange}
                      placeholder={t('post.write.contentPlaceholder')}
                      value={value}
                      decoration="boxed"
                      error={errors.content ? errors.content.message : ''}
                    />
                  )}
                  rules={{required: true, validate: (value) => !!value}}
                />
                <Controller
                  control={control}
                  name="url"
                  render={({field: {onChange, value}}) => (
                    <EditText
                      styles={{
                        label: css`
                          font-size: 14px;
                          margin-bottom: -4px;
                        `,
                      }}
                      colors={{focused: theme.role.primary}}
                      label={t('post.write.urlTitle')}
                      onChangeText={onChange}
                      placeholder={t('post.write.urlPlaceholder')}
                      value={value}
                      decoration="boxed"
                      error={errors.url ? errors.url.message : ''}
                    />
                  )}
                  rules={{required: true, validate: (value) => !!value}}
                />
                <MultiUploadImageInput
                  imageUris={assets.map((el) => el.uri)}
                  loading={isSubmitting}
                  onAdd={(assetsAdded) => {
                    setAssets(
                      [...assets, ...assetsAdded].splice(
                        0,
                        MAX_IMAGES_UPLOAD_LENGTH,
                      ),
                    );
                  }}
                  onDelete={(index) => {
                    const newAssets = assets.filter((_, i) => i !== index);
                    setAssets(newAssets);
                  }}
                  styles={{
                    container: css`
                      opacity: ${isSubmitting ? '0.5' : '1'};
                    `,
                  }}
                />
              </Content>
            </CustomScrollView>
          </KeyboardAvoidingView>
        );
      default:
        return null;
    }
  })();

  return (
    <Container>
      <Stack.Screen
        options={{
          title: post?.title || t('common.post'),
          headerRight: () => (
            <Pressable
              onPress={handleSubmit(handleUpdatePost)}
              hitSlop={{
                bottom: 8,
                left: 8,
                right: 8,
                top: 8,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={theme.text.label} />
              ) : (
                <Typography.Body3>{t('common.update')}</Typography.Body3>
              )}
            </Pressable>
          ),
        }}
      />
      {content}
    </Container>
  );
}
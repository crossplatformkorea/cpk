import styled, {css} from '@emotion/native';
import {Stack, useRouter} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import {t} from '../../../src/STRINGS';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {authRecoilState, postsRecoilState} from '../../../src/recoil/atoms';
import {fetchCreatePost} from '../../../src/apis/postQueries';
import MultiUploadImageInput from '../../../src/components/uis/MultiUploadImageInput';
import {useState} from 'react';
import {ImagePickerAsset} from 'expo-image-picker';
import {MAX_IMAGES_UPLOAD_LENGTH} from '../../../src/utils/constants';
import CustomScrollView from '../../../src/components/uis/CustomScrollView';
import {uploadFileToSupabase} from '../../../src/supabase';
import {RectButton} from 'react-native-gesture-handler';
import useSupabase from '../../../src/hooks/useSupabase';
import {EditText, Typography, useCPK} from 'cpk-ui';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const Content = styled.View`
  gap: 16px;
`;

const schema = yup.object().shape({
  title: yup.string().required(t('post.write.titlePlaceholder')),
  content: yup.string().required(t('post.write.contentPlaceholder')),
  url: yup.string().url(t('common.invalidUrl')),
});

type FormData = yup.InferType<typeof schema>;

export default function PostWrite(): JSX.Element {
  const {supabase} = useSupabase();
  const {back} = useRouter();
  const {theme, snackbar} = useCPK();
  const {authId} = useRecoilValue(authRecoilState);
  const setPosts = useSetRecoilState(postsRecoilState);
  const [assets, setAssets] = useState<ImagePickerAsset[]>([]);
  const [isCreatePostInFlight, setIsCreatePostInFlight] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleWritePost: SubmitHandler<FormData> = async (data) => {
    if (!authId || !supabase) return;

    setIsCreatePostInFlight(true);

    try {
      const imageUploadPromises = assets.map(async (asset) => {
        const destPath = `${asset.type === 'video' ? 'videos' : 'images'}/${Date.now()}_${asset.fileName}`;
        const file = asset.uri;

        return await uploadFileToSupabase({
          uri: file,
          fileType: asset.type === 'video' ? 'Video' : 'Image',
          bucket: 'images',
          destPath,
          supabase,
        });
      });

      const imageUploads = await Promise.all(imageUploadPromises);

      const images = imageUploads
        .filter((el) => !!el)
        .map((el) => ({
          ...el,
          image_url: el?.image_url || undefined,
        }));

      const newPost = await fetchCreatePost({
        supabase,
        post: {
          title: data.title,
          content: data.content,
          user_id: authId,
          images,
        },
      });

      setPosts((prevPosts) => [newPost, ...prevPosts]);

      snackbar.open({
        text: t('post.write.writeSuccess'),
        color: 'success',
      });

      back();
    } catch (e) {
      snackbar.open({
        text: t('post.write.writeFailed'),
        color: 'danger',
      });

      if (__DEV__) console.error('Error adding post:', e);
    } finally {
      setIsCreatePostInFlight(false);
    }
  };

  return (
    <Container>
      <Stack.Screen
        options={{
          title: t('post.write.write'),
          headerRight: () =>
            Platform.OS === 'web' ? (
              <Pressable
                onPress={handleSubmit(handleWritePost)}
                style={css`
                  margin: 0 12px;
                  border-radius: 48px;
                `}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.text.label} />
                ) : (
                  <Typography.Body3>
                    {t('post.write.register')}
                  </Typography.Body3>
                )}
              </Pressable>
            ) : (
              <RectButton
                // @ts-ignore
                onPress={handleSubmit(handleWritePost)}
                activeOpacity={0}
                style={css`
                  margin-top: 4px;
                  margin-right: -4px;
                  border-radius: 99px;

                  align-items: center;
                  justify-content: center;
                `}
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
                  <Typography.Body3>
                    {t('post.write.register')}
                  </Typography.Body3>
                )}
              </RectButton>
            ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', default: undefined})}
        keyboardVerticalOffset={Platform.select({ios: 56})}
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
                  required
                  styles={{
                    label: css`
                      font-size: 14px;
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
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
                  required
                  styles={{
                    label: css`
                      font-size: 14px;
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
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
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
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
              loading={isCreatePostInFlight}
              onAdd={(assetsAdded) => {
                setAssets(
                  [...assets, ...assetsAdded].splice(
                    0,
                    MAX_IMAGES_UPLOAD_LENGTH,
                  ),
                );
              }}
              onDelete={(index) => {
                setAssets(assets.filter((_, i) => i !== index));
              }}
              styles={{
                container: css`
                  opacity: ${isCreatePostInFlight ? '0.5' : '1'};
                `,
              }}
            />
            <View
              style={css`
                height: 48px;
              `}
            />
          </Content>
        </CustomScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

import styled, {css} from '@emotion/native';
import {Redirect, Stack} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useState, useEffect} from 'react';
import useSwr from 'swr';
import {t} from '../../src/STRINGS';
import CustomScrollView from '../../src/components/uis/CustomScrollView';
import ProfileImageInput from '../../src/components/fragments/ProfileImageInput';
import {delayPressIn} from '../../src/utils/constants';
import {
  fetchUpdateProfile,
  fetchUserProfile,
} from '../../src/apis/profileQueries';
import {uploadFileToSupabase} from '../../src/supabase';
import {useRecoilState} from 'recoil';
import {authRecoilState} from '../../src/recoil/atoms';
import {ImageInsertArgs} from '../../src/types';
import FallbackComponent from '../../src/components/uis/FallbackComponent';
import {showAlert, showConfirm} from '../../src/utils/alert';
import {RectButton} from 'react-native-gesture-handler';
import ErrorBoundary from 'react-native-error-boundary';
import useSupabase, {SupabaseClient} from '../../src/hooks/useSupabase';
import CustomLoadingIndicator from '../../src/components/uis/CustomLoadingIndicator';
import {useAuth} from '@clerk/clerk-expo';
import {CustomPressable, EditText, Icon, Typography, useCPK} from 'cpk-ui';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const SectionHeaderGradient = styled(LinearGradient)`
  height: 180px;
  justify-content: center;
  align-items: center;
`;

const UserImageView = styled.View`
  position: absolute;
  bottom: -56px;
  left: 20px;
`;

const Content = styled.View`
  flex: 1;
  padding: 60px 24px 24px 24px;
  gap: 16px;
`;

const schema = yup.object().shape({
  display_name: yup.string().required(t('common.requiredField')).min(2).max(20),
  github_id: yup.string().required(t('common.requiredField')),
  affiliation: yup.string().required(t('common.requiredField')),
  avatar_url: yup.string(),
  meetup_id: yup.string(),
  other_sns_urls: yup.array().of(yup.string()),
  tags: yup.array().of(yup.string()),
  desired_connection: yup.string(),
  introduction: yup.string(),
  motivation_for_event_participation: yup.string(),
  future_expectations: yup.string(),
});

type FormData = yup.InferType<
  typeof schema & {
    tags: string[];
    profileImg?: string;
  }
>;

const fetcher = async (
  clerkId: string | null | undefined,
  supabase: SupabaseClient,
) => {
  if (!clerkId) return;

  const {profile, userTags} = await fetchUserProfile({
    clerkId,
    supabase,
  });

  return {profile, userTags};
};

export default function Onboarding(): JSX.Element {
  const {theme} = useCPK();
  const [displayNameError, setDisplayNameError] = useState<string>();
  const [{user}, setAuth] = useRecoilState(authRecoilState);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [profileImg, setProfileImg] = useState<string>();
  const {supabase} = useSupabase();
  const {signOut, isSignedIn, userId} = useAuth();

  const {data, error} = useSwr(userId && `/profile/${userId}`, () =>
    fetcher(userId, supabase!),
  );

  const handleAddTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag('');
    }
  };

  const handleSignOut = async () => {
    const result = await showConfirm({
      title: t('onboarding.signOutTitle'),
      description: t('onboarding.signOutDescription'),
    });

    if (result) {
      signOut();
    }
  };

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFinishOnboarding: SubmitHandler<FormData> = async (data) => {
    if (!userId || !supabase) return;

    let image: ImageInsertArgs | undefined = {};

    if (profileImg && !profileImg.startsWith('http')) {
      const destPath = `users/${userId}`;

      image = await uploadFileToSupabase({
        uri: profileImg,
        fileType: 'Image',
        bucket: 'images',
        destPath,
        supabase,
      });
    }

    const formDataWithTags = {
      ...data,
      avatar_url: image?.image_url || undefined,
    };

    try {
      const updatedUser = await fetchUpdateProfile({
        args: formDataWithTags,
        clerkId: userId,
        tags: tags || [],
        supabase,
      });

      if (updatedUser) {
        setTags(tags);
        setAuth((prev) => ({...prev, user: updatedUser}));
      }
    } catch (error: any) {
      if (error?.name === 'displayName') {
        setDisplayNameError(error?.message || '');
        return;
      }

      showAlert((error as Error)?.message || '');
    }
  };

  useEffect(() => {
    if (data?.profile) {
      setValue('display_name', data.profile.display_name || '');
      setValue('meetup_id', data.profile.meetup_id || '');
      setValue('github_id', data.profile.github_id || '');
      setValue('affiliation', data.profile.affiliation || '');
      setValue('introduction', data.profile.introduction || '');
      setValue('desired_connection', data.profile.desired_connection || '');
      setValue(
        'motivation_for_event_participation',
        data.profile.motivation_for_event_participation || '',
      );
      setValue('future_expectations', data.profile.future_expectations || '');
      setTags(data.userTags);
      setProfileImg(data.profile.avatar_url || undefined);
    }
  }, [data, setValue]);

  if (!user?.id || !isSignedIn) {
    return (
      <>
        <Stack.Screen options={{headerShown: false}} />
        <CustomLoadingIndicator />
      </>
    );
  }

  if (user?.display_name) {
    return <Redirect href={'/(tabs)'} />;
  }

  if (error) {
    return <FallbackComponent />;
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Stack.Screen
        options={{
          title: t('onboarding.title'),
          headerShown: true,
          headerRight: () => (
            <RectButton
              activeOpacity={0}
              // @ts-ignore
              onPress={handleSubmit(handleFinishOnboarding)}
              hitSlop={{
                bottom: 8,
                left: 8,
                right: 8,
                top: 8,
              }}
              style={[
                css`
                  margin-top: 4px;
                  align-items: center;
                  justify-content: center;
                  padding: 2px;
                  margin-right: -4px;
                  border-radius: 99px;
                `,
                Platform.OS === 'web' &&
                  css`
                    margin-right: 20px;
                  `,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={theme.text.label} />
              ) : (
                <Typography.Body3>{t('common.done')}</Typography.Body3>
              )}
            </RectButton>
          ),
        }}
      />
      <Container>
        <KeyboardAvoidingView
          behavior={Platform.select({ios: 'padding', default: undefined})}
          keyboardVerticalOffset={80}
          style={[
            css`
              background-color: ${theme.bg.basic};
              flex: 1;
              align-self: stretch;
            `,
          ]}
        >
          <CustomScrollView bounces={false}>
            <View>
              <SectionHeaderGradient
                colors={[theme.brand, theme.bg.basic]}
                style={css`
                  padding: 24px 24px 36px 24px;
                  text-align: center;
                  gap: 6px;
                `}
              >
                <Text
                  onLongPress={handleSignOut}
                  style={css`
                    font-size: 20px;
                    font-family: Pretendard-Bold;
                    color: ${theme.text.basic};
                    padding-bottom: 4px;
                  `}
                >
                  {t('onboarding.sectionTitle')}
                </Text>
                <Text
                  style={css`
                    font-size: 16px;
                    font-family: Pretendard-Bold;
                    color: ${theme.text.label};
                    opacity: 0.8;
                    padding-bottom: 4px;
                    text-align: center;
                  `}
                >
                  {t('onboarding.sectionDescription')}
                </Text>
              </SectionHeaderGradient>
              <UserImageView
                style={css`
                  height: 108px;
                `}
              >
                <ProfileImageInput
                  imageUri={profileImg}
                  onChangeImageUri={setProfileImg}
                  onDeleteImageUri={() => setProfileImg(undefined)}
                  style={css`
                    margin-bottom: 12px;
                  `}
                />
              </UserImageView>
            </View>
            <Content>
              <Controller
                control={control}
                name="display_name"
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
                    label={t('onboarding.displayName')}
                    onChangeText={onChange}
                    placeholder={t('onboarding.displayNamePlaceholder')}
                    value={value}
                    decoration="boxed"
                    error={
                      displayNameError
                        ? displayNameError
                        : errors.display_name
                          ? t('error.displayNameInvalid')
                          : ''
                    }
                  />
                )}
                rules={{required: true, validate: (value) => !!value}}
              />
              <Controller
                control={control}
                name="github_id"
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
                    label={t('onboarding.githubId')}
                    onChangeText={onChange}
                    placeholder={t('onboarding.githubIdPlaceholder')}
                    value={value}
                    decoration="boxed"
                    error={errors.github_id ? errors.github_id.message : ''}
                  />
                )}
                rules={{validate: (value) => !!value}}
              />
              <Controller
                control={control}
                name="affiliation"
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
                    label={t('onboarding.affiliation')}
                    onChangeText={onChange}
                    placeholder={t('onboarding.affiliationPlaceholder')}
                    value={value}
                    decoration="boxed"
                    error={errors.affiliation ? errors.affiliation.message : ''}
                  />
                )}
                rules={{validate: (value) => !!value}}
              />
              <Controller
                control={control}
                name="meetup_id"
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
                    label={t('onboarding.meetupId')}
                    onChangeText={onChange}
                    placeholder={t('onboarding.meetupIdPlaceholder')}
                    value={value}
                    decoration="boxed"
                    error={errors.meetup_id ? errors.meetup_id.message : ''}
                  />
                )}
                rules={{validate: (value) => !!value}}
              />
              <Controller
                control={control}
                name="introduction"
                render={({field: {onChange, value}}) => (
                  <EditText
                    styles={{
                      label: css`
                        font-size: 14px;
                      `,
                      labelContainer: css`
                        margin-bottom: 8px;
                      `,
                      input: css`
                        min-height: 120px;
                      `,
                    }}
                    multiline
                    colors={{focused: theme.role.primary}}
                    label={t('onboarding.introduction')}
                    onChangeText={onChange}
                    placeholder={t('onboarding.introductionPlaceholder')}
                    value={value}
                    decoration="boxed"
                    error={
                      errors.introduction ? errors.introduction.message : ''
                    }
                  />
                )}
                rules={{validate: (value) => !!value}}
              />
              <Controller
                control={control}
                name="desired_connection"
                render={({field: {onChange, value}}) => (
                  <EditText
                    styles={{
                      label: css`
                        font-size: 14px;
                      `,
                      labelContainer: css`
                        margin-bottom: 8px;
                      `,
                      input: css`
                        min-height: 120px;
                      `,
                    }}
                    multiline
                    colors={{focused: theme.role.primary}}
                    label={t('onboarding.desiredConnection')}
                    onChangeText={onChange}
                    placeholder={t('onboarding.desiredConnectionPlaceholder')}
                    value={value}
                    decoration="boxed"
                    error={
                      errors.desired_connection
                        ? errors.desired_connection.message
                        : ''
                    }
                  />
                )}
                rules={{validate: (value) => !!value}}
              />
              <Controller
                control={control}
                name="motivation_for_event_participation"
                render={({field: {onChange, value}}) => (
                  <EditText
                    styles={{
                      label: css`
                        font-size: 14px;
                      `,
                      labelContainer: css`
                        margin-bottom: 8px;
                      `,
                      input: css`
                        min-height: 120px;
                      `,
                    }}
                    multiline
                    colors={{focused: theme.role.primary}}
                    label={t('onboarding.motivationForEventParticipation')}
                    onChangeText={onChange}
                    placeholder={t(
                      'onboarding.motivationForEventParticipationPlaceholder',
                    )}
                    value={value}
                    decoration="boxed"
                    error={
                      errors.motivation_for_event_participation
                        ? errors.motivation_for_event_participation.message
                        : ''
                    }
                  />
                )}
                rules={{validate: (value) => !!value}}
              />
              <Controller
                control={control}
                name="future_expectations"
                render={({field: {onChange, value}}) => (
                  <EditText
                    styles={{
                      label: css`
                        font-size: 14px;
                      `,
                      labelContainer: css`
                        margin-bottom: 8px;
                      `,
                      input: css`
                        min-height: 120px;
                      `,
                    }}
                    multiline
                    colors={{focused: theme.role.primary}}
                    label={t('onboarding.futureExpectations')}
                    onChangeText={onChange}
                    placeholder={t('onboarding.futureExpectationsPlaceholder')}
                    value={value}
                    decoration="boxed"
                    error={
                      errors.future_expectations
                        ? errors.future_expectations.message
                        : ''
                    }
                  />
                )}
                rules={{validate: (value) => !!value}}
              />

              {/* Tags */}
              <Controller
                control={control}
                name="tags"
                render={() => (
                  <>
                    <View
                      style={css`
                        flex-direction: row;
                      `}
                    >
                      <EditText
                        decoration="boxed"
                        editable={!isSubmitting}
                        label={t('onboarding.yourTags')}
                        onChangeText={(text) => {
                          setTag(
                            text.length > 12
                              ? text.trim().slice(0, 20)
                              : text.trim(),
                          );
                        }}
                        onSubmitEditing={handleAddTag}
                        placeholder={t('onboarding.yourTagsPlaceholder')}
                        style={css`
                          flex: 1;
                        `}
                        styles={{
                          container: css`
                            border-radius: 4px;
                          `,
                        }}
                        textInputProps={{
                          returnKeyLabel: t('common.add'),
                          returnKeyType: 'done',
                        }}
                        value={tag}
                      />
                      <View
                        style={css`
                          flex-direction: row;
                          justify-content: center;
                          align-items: center;
                        `}
                      >
                        <CustomPressable
                          delayHoverIn={delayPressIn}
                          disabled={isSubmitting}
                          onPress={handleAddTag}
                          style={css`
                            margin-top: 32px;
                            margin-left: 12px;
                            border-radius: 48px;
                          `}
                        >
                          <Icon
                            name="PlusCircle"
                            size={20}
                            style={css`
                              color: ${theme.text.placeholder};
                            `}
                          />
                        </CustomPressable>
                      </View>
                    </View>
                    <View
                      style={css`
                        flex-direction: row;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin-bottom: 16px;
                      `}
                    >
                      {tags.map((tag, index) => (
                        <View
                          key={index}
                          style={css`
                            background-color: ${theme.bg.paper};
                            padding: 8px;
                            border-radius: 4px;
                            flex-direction: row;
                            align-items: center;
                          `}
                        >
                          <Text
                            style={css`
                              color: ${theme.text.basic};
                            `}
                          >
                            {tag}
                          </Text>
                          <CustomPressable
                            delayHoverIn={delayPressIn}
                            onPress={() =>
                              setTags(tags.filter((t) => t !== tag))
                            }
                            style={css`
                              margin-left: 8px;
                            `}
                          >
                            <Icon
                              name="XCircle"
                              size={20}
                              style={css`
                                color: ${theme.text.placeholder};
                              `}
                            />
                          </CustomPressable>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              />
            </Content>
          </CustomScrollView>
        </KeyboardAvoidingView>
      </Container>
    </ErrorBoundary>
  );
}

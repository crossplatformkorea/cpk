import {supabase} from '../supabase';
import {User, UserUpdateArgs} from '../types';

export const fetchUserProfile = async (authId: string) => {
  const {data: profile, error: profileError} = await supabase
    .from('users')
    .select('*')
    .eq('id', authId)
    .single();

  if (profileError) {
    if (__DEV__) {
      console.error(profileError);
    }
  }

  const {data: tagsData, error: tagsError} = await supabase
    .from('_TagToUser')
    .select('A')
    .eq('B', authId);

  if (tagsError) {
    throw new Error(tagsError.message);
  }

  const tagIds = tagsData.map((tag) => tag.A);

  const {data: tags, error: tagsFetchError} = await supabase
    .from('tags')
    .select('tag')
    .in('id', tagIds);

  if (tagsFetchError) {
    if (__DEV__) {
      console.error(tagsFetchError);
    }
  }

  const userTags = tags?.map((tag) => tag.tag) || [];

  return {profile, userTags};
};

export const fetchUpdateProfile = async ({
  args,
  authId,
  tags,
}: {
  args: UserUpdateArgs;
  tags: string[];
  authId: string;
}) => {
  const {data: updatedProfile, error: updateError} = await supabase
    .from('users')
    .update({
      ...args,
    })
    .eq('id', authId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  tags.forEach(async (tag) => {
    if (!tag) return;

    const tagData = tag.toLowerCase();

    const {data} = await supabase
      .from('tags')
      .upsert({tag: tagData})
      .eq('tag', tagData)
      .eq('id', authId)
      .select('id')
      .single();

    if (data?.id) {
      await supabase.from('_TagToUser').upsert(
        {
          A: data.id,
          B: authId,
        },
        {
          ignoreDuplicates: true,
        },
      );
    }
  });

  return updatedProfile as unknown as User;
};

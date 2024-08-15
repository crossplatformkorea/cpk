import {getDeviceTypeSync} from 'react-native-device-info';
import {t} from '../STRINGS';
import {supabase} from '../supabase';

export const fetchUserPoints = async (authId: string) => {
  const {data, error: pointsError} = await supabase
    .from('purchases')
    .select('points')
    .eq('user_id', authId);

  if (pointsError) {
    if (__DEV__) {
      console.error(pointsError);
    }
    throw new Error(t('error.failedToFetchData'));
  }

  const totalPoints =
    data?.reduce((acc, purchase) => acc + (purchase.points || 0), 0) || 0;

  return totalPoints;
};

export const fetchUserPurchases = async (authId: string) => {
  const {data, error: profileError} = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', authId)
    .single();

  if (profileError) {
    if (__DEV__) {
      console.error(profileError);
    }
    throw new Error(t('error.failedToFetchData'));
  }

  return data;
};

export const fetchCreatePurchase = async ({
  authId,
  points,
  productId,
  receipt,
}: {
  authId: string;
  points: number;
  productId: string;
  receipt: string;
}): Promise<boolean> => {
  const {error} = await supabase.from('purchases').insert({
    user_id: authId,
    points,
    product_id: productId,
    receipt,
    device: getDeviceTypeSync(),
  });

  if (error) {
    throw new Error(t('error.failedToFetchData'));
  }

  return true;
};

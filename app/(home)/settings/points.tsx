import {
  endConnection,
  finishTransaction,
  getProducts,
  initConnection,
  isProductAndroid,
  isProductIos,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'expo-iap';
import type {
  Product,
  ProductPurchase,
  PurchaseError,
} from 'expo-iap/build/ExpoIap.types';
import type {} from 'expo-iap/build/types/ExpoIapAndroid.types';
import {Stack} from 'expo-router';
import {useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {t} from '../../../src/STRINGS';
import styled, {css} from '@emotion/native';
import {
  fetchCreatePurchase,
  fetchUserPoints,
} from '../../../src/apis/purchaseQueries';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../../src/recoil/atoms';
import {Button, Icon, Typography, useDooboo} from 'dooboo-ui';
import {showAlert} from '../../../src/utils/alert';

const productSkus = [
  'cpk.points.200',
  'cpk.points.500',
  'cpk.points.1000',
  'cpk.points.5000',
  'cpk.points.10000',
  'cpk.points.30000',
];

const Container = styled.View`
  background-color: ${({theme}) => theme.bg.basic};

  flex: 1;
  align-self: stretch;
`;

const Content = styled.ScrollView`
  padding: 16px;
`;

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const {authId} = useRecoilValue(authRecoilState);
  const {theme} = useDooboo();

  useEffect(() => {
    const getUserPoints = async () => {
      const data = await fetchUserPoints(authId!);
      setUserPoints(data || 0);
    };

    authId && getUserPoints();
  }, [authId]);

  useEffect(() => {
    const initIAP = async () => {
      if (await initConnection()) {
        setIsConnected(true);
      }

      const products = await getProducts(productSkus);
      products.sort((a, b) => {
        if (isProductAndroid(a) && isProductAndroid(b)) {
          return (
            parseInt(a?.oneTimePurchaseOfferDetails?.priceAmountMicros || '0') -
            parseInt(b?.oneTimePurchaseOfferDetails?.priceAmountMicros || '0')
          );
        }

        if (isProductIos(a) && isProductIos(b)) {
          return a.price - b.price;
        }

        return 0;
      });
      setProducts(products);
    };

    initIAP();

    return () => {
      endConnection();
    };
  }, []);

  useEffect(() => {
    const purchaseUpdatedSubs = purchaseUpdatedListener(
      (purchase: ProductPurchase) => {
        const ackPurchase = async (purchase: ProductPurchase) => {
          await finishTransaction({
            purchase,
            isConsumable: true,
          });
        };

        InteractionManager.runAfterInteractions(async () => {
          const receipt = purchase && purchase.transactionReceipt;

          if (receipt) {
            const result = await fetchCreatePurchase({
              authId: authId!,
              points: parseInt(purchase?.productId.split('.').pop() || '0'),
              productId: purchase?.productId || '',
              receipt,
            });

            if (result) {
              ackPurchase(purchase);
            }
          }
        });
      },
    );

    const purchaseErrorSubs = purchaseErrorListener((error: PurchaseError) => {
      InteractionManager.runAfterInteractions(() => {
        showAlert(error?.message);
      });
    });

    return () => {
      purchaseUpdatedSubs.remove();
      purchaseErrorSubs.remove();
      endConnection();
    };
  }, [authId]);

  return (
    <Container>
      <Stack.Screen options={{title: t('points.title')}} />
      <View
        style={css`
          align-self: stretch;

          flex-direction: row;
          padding: 8px 16px;
          align-items: center;
          gap: 12px;
          background-color: ${theme.bg.paper};
        `}
      >
        <Typography.Body2
          style={css`
            font-family: Pretendard-Bold;
          `}
        >
          {t('points.myPoints')}
        </Typography.Body2>
        <View
          style={css`
            flex-direction: row;
            align-items: center;
            gap: 4px;
          `}
        >
          <Icon name="Coins" />
          <Typography.Body2
            style={css`
              font-family: Pretendard-Bold;
            `}
          >
            {userPoints}
          </Typography.Body2>
        </View>
      </View>

      <Content>
        {isConnected
          ? products.map((item) => {
              if (isProductAndroid(item)) {
                return (
                  <View
                    key={item.title}
                    style={css`
                      flex: 1;
                      margin-bottom: 8px;

                      flex-direction: row;
                      gap: 12px;
                      justify-content: space-between;
                    `}
                  >
                    <Typography.Body2>
                      <Icon name="Coins" /> {item.title}
                    </Typography.Body2>
                    <Button
                      text={item.oneTimePurchaseOfferDetails?.formattedPrice}
                      onPress={() => {
                        requestPurchase({skus: [item.productId]});
                      }}
                    />
                  </View>
                );
              }

              if (isProductIos(item)) {
                return (
                  <View
                    key={item.id}
                    style={css`
                      flex: 1;
                      margin-bottom: 8px;

                      flex-direction: row;
                      gap: 12px;
                      justify-content: space-between;
                    `}
                  >
                    <Typography.Body2>
                      <Icon name="Coins" /> {item.displayName}
                    </Typography.Body2>
                    <Button
                      text={item.displayPrice}
                      size="small"
                      color="success"
                      styles={{
                        container: css`
                          border-width: 0;
                          width: 88px;
                          padding: 6px 4px;
                        `,
                      }}
                      onPress={() => {
                        requestPurchase({sku: item.id});
                      }}
                    />
                  </View>
                );
              }
            })
          : null}
      </Content>
    </Container>
  );
}

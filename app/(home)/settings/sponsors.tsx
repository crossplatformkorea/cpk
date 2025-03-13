import {
  endConnection,
  getProducts,
  getSubscriptions,
  initConnection,
  isProductAndroid,
  isProductIos,
  isSubscriptionProductAndroid,
  isSubscriptionProductIos,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  requestSubscription,
} from 'expo-iap';
import {Stack} from 'expo-router';
import {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  InteractionManager,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {t} from '../../../src/STRINGS';
import {
  Product,
  ProductPurchase,
  PurchaseError,
  SubscriptionProduct,
} from 'expo-iap/src/ExpoIap.types';
import {RequestSubscriptionAndroidProps} from 'expo-iap/src/types/ExpoIapAndroid.types';
import {ProductIos} from 'expo-iap/src/types/ExpoIapIos.types';

const productSkus = [
  'cpk.points.1000',
  'cpk.points.5000',
  'cpk.points.10000',
  'cpk.points.30000',
];

const subscriptionSkus = [
  'cpk.membership.monthly.bronze',
  'cpk.membership.monthly.silver',
];

const operations = [
  'initConnection',
  'getProducts',
  'getSubscriptions',
  'endConnection',
] as const;

type Operation = (typeof operations)[number];

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionProduct[]>([]);

  const handleOperation = async (operation: Operation) => {
    switch (operation) {
      case 'initConnection':
        if (await initConnection()) setIsConnected(true);
        return;

      case 'endConnection':
        if (await endConnection()) {
          setProducts([]);
          setSubscriptions([]);
          setIsConnected(false);
        }
        break;

      case 'getProducts':
        try {
          const fetchedProducts = await getProducts(productSkus);
          setProducts(fetchedProducts);
        } catch (error) {
          console.error(error);
        }
        break;

      case 'getSubscriptions':
        try {
          const fetchedSubscriptions = await getSubscriptions(subscriptionSkus);
          setSubscriptions(fetchedSubscriptions);
        } catch (error) {
          console.error(error);
        }
        break;

      default:
        console.log('Unknown operation');
    }
  };

  useEffect(() => {
    const purchaseUpdatedSubs = purchaseUpdatedListener(
      (purchase: ProductPurchase) => {
        InteractionManager.runAfterInteractions(() => {
          Alert.alert('Purchase updated', JSON.stringify(purchase));
        });
      },
    );

    const purchaseErrorSubs = purchaseErrorListener((error: PurchaseError) => {
      InteractionManager.runAfterInteractions(() => {
        Alert.alert('Purchase error', JSON.stringify(error));
      });
    });

    return () => {
      purchaseUpdatedSubs.remove();
      purchaseErrorSubs.remove();
      endConnection();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{title: t('settings.sponsors')}} />
      <Text style={styles.title}>Expo IAP Example</Text>
      <View style={styles.buttons}>
        <ScrollView contentContainerStyle={styles.buttonsWrapper} horizontal>
          {operations.map((operation) => (
            <Pressable
              key={operation}
              onPress={() => handleOperation(operation)}
            >
              <View style={styles.buttonView}>
                <Text>{operation}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View style={styles.content}>
        {!isConnected ? (
          <Text>Not connected</Text>
        ) : (
          <View style={{gap: 12}}>
            <Text style={{fontSize: 20}}>Products</Text>
            {products.map((product) => {
              if (isProductIos(product)) {
                const iosProduct: ProductIos = product;

                return (
                  <View key={iosProduct.id} style={{gap: 12}}>
                    <Text>
                      {iosProduct.displayName} - {iosProduct.displayPrice}
                    </Text>
                    <Button
                      title="Buy"
                      onPress={() => {
                        requestPurchase({
                          sku: product.id,
                        });
                      }}
                    />
                  </View>
                );
              }

              if (isProductAndroid(product)) {
                return (
                  <View key={product.title} style={{gap: 12}}>
                    <Text>
                      {product.title} -{' '}
                      {product.oneTimePurchaseOfferDetails?.formattedPrice}
                    </Text>
                    <Button
                      title="Buy"
                      onPress={() => {
                        requestPurchase({
                          skus: [product.id],
                        });
                      }}
                    />
                  </View>
                );
              }

              return null;
            })}

            <Text style={{fontSize: 20}}>Subscriptions</Text>
            {subscriptions.map((subscription) => {
              if (isSubscriptionProductAndroid(subscription)) {
                return subscription.subscriptionOfferDetails?.map((offer) => (
                  <View
                    key={offer.offerId ?? subscription.id}
                    style={{gap: 12}}
                  >
                    <Text>
                      {subscription.title} -{' '}
                      {offer.pricingPhases.pricingPhaseList
                        .map((ppl) => ppl.billingPeriod)
                        .join(',')}
                    </Text>
                    <Button
                      title="Subscribe"
                      onPress={() => {
                        requestSubscription({
                          skus: [subscription.id],
                          ...(offer.offerToken && {
                            subscriptionOffers: [
                              {
                                sku: subscription.id,
                                offerToken: offer.offerToken,
                              },
                            ],
                          }),
                        } as RequestSubscriptionAndroidProps);
                      }}
                    />
                  </View>
                ));
              }

              if (isSubscriptionProductIos(subscription)) {
                return (
                  <View key={subscription.id} style={{gap: 12}}>
                    <Text>
                      {subscription.displayName} - {subscription.displayPrice}
                    </Text>
                    <Button
                      title="Subscribe"
                      onPress={() => {
                        requestSubscription({sku: subscription.id});
                      }}
                    />
                  </View>
                );
              }

              return null;
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttons: {
    height: 90,
  },
  buttonsWrapper: {
    padding: 24,
    gap: 8,
  },
  buttonView: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  content: {
    flex: 1,
    alignSelf: 'stretch',
    padding: 24,
    gap: 12,
  },
});

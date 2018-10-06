/* eslint-env jest */
import { ChainTypes } from 'bitsharesjs';
import ApiSamples from './api_samples.js';

const Apis = {};

const orders = [];
const marketSubscribers = [];

Apis.addOrder = (order) => {
  orders.push(order);
  Apis.newOrderEvent(order);
};
Apis.newOrderEvent = (order) => {
  const {
    sell_price: {
      base: {
        asset_id: baseAsset
      },
      quote: {
        asset_id: quoteAsset
      }
    }
  } = order;
  marketSubscribers.forEach(([callback, baseId, quoteId]) => {
    if (baseId === baseAsset && quoteId === quoteAsset) {
      callback([[order]]);
    }
  });
};

Apis.deleteOrder = (orderId) => {
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    Apis.deleteOrderEvent(orderId);
    orders.splice(idx, 1);
  }
};
Apis.deleteOrderEvent = (orderId) => {
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    marketSubscribers.forEach(([callback, baseId, quoteId]) => {
      const {
        sell_price: {
          base: {
            asset_id: baseAsset
          },
          quote: {
            asset_id: quoteAsset
          }
        }
      } = orders[idx];
      if (baseId === baseAsset && quoteId === quoteAsset) {
        callback([[orderId]]);
      }
    });
  }
};

Apis.fillOrder = (orderId, amount) => {
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].for_sale -= amount;
    const notification = {
      fee: {
        amount: 0,
        asset_id: orders[idx].sell_price.base.asset_id
      },
      order_id: orderId,
      account_id: 0,
      pays: {
        amount,
        asset_id: orders[idx].sell_price.base.asset_id
      },
      receives: {
        // TODO: calculate receives
        amount: 0,
        asset_id: orders[idx].sell_price.quote.asset_id
      },
      fill_price: orders[idx].sell_price,
      is_maker: false
    };
    Apis.fillOrderEvent([[notification]]);
  }
};
Apis.fillOrderEvent = (notification) => {
  const idx = orders.findIndex(o => o.id === notification.order_id);
  if (idx !== -1) {
    marketSubscribers.forEach(({ callback, baseId, quoteId }) => {
      const {
        sell_price: {
          base: {
            asset_id: baseAsset
          },
          quote: {
            asset_id: quoteAsset
          }
        }
      } = orders[idx];

      if (baseId === baseAsset && quoteId === quoteAsset) {
        callback([[ChainTypes.operations.fill_order, notification]]);
      }
    });
  }
};

Apis.instance = () => {
  return {
    init_promise: new Promise(resolve => resolve()),
    db_api: () => {
      return {
        exec: (name, data) => {
          return new Promise(resolve => {
            switch (name) {
              case 'get_full_accounts': {
                const [[nameOrId]] = data;
                const res = ApiSamples.get_full_accounts[nameOrId];
                resolve(res || []);
                break;
              }
              case 'get_key_references': {
                const [[key]] = data;
                const res = ApiSamples.get_key_references[key];
                resolve(res || [[]]);
                break;
              }
              case 'get_objects': {
                const [[id]] = data;
                const res = ApiSamples.get_objects[id];
                resolve(res);
                break;
              }
              case 'get_required_fees': {
                resolve(ApiSamples.get_required_fees);
                break;
              }
              case 'get_limit_orders': {
                const [base, quote, limit] = data;
                const result = orders.filter(order => {
                  const {
                    sell_price: {
                      base: {
                        asset_id: baseAsset
                      },
                      quote: {
                        asset_id: quoteAsset
                      }
                    }
                  } = order;
                  return baseAsset === base && quoteAsset === quote;
                }).slice(0, limit);
                resolve(result);
                break;
              }
              case 'subscribe_to_market': {
                marketSubscribers.push(data);
                resolve();
                break;
              }
              default: resolve();
            }
          });
        }
      };
    }
  };
};
const ChainConfig = {
  address_prefix: 'BTS'
};

export { Apis, ChainConfig };

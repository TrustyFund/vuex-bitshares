import { Apis } from 'bitsharesjs-ws';
import * as utils from '../../utils';
import listener from './chain-listener';
import Subscriptions from './subscriptions';
import config from '../../../config';


const findOrder = (orderId) => {
  return (order) => orderId === order.id;
};

const calcOrderRate = (order) => {
  const {
    sell_price: {
      quote: {
        amount: quoteAmount
      },
      base: {
        amount: baseAmount
      }
    }
  } = order;
  return baseAmount / quoteAmount;
};

const loadLimitOrders = async (baseId, quoteId, limit = 500) => {
  const orders = await Apis.instance().db_api().exec(
    'get_limit_orders',
    [baseId, quoteId, limit]
  );
  const buyOrders = [];
  const sellOrders = [];
  orders.forEach((order) => {
    if (order.sell_price.base.asset_id === baseId) {
      buyOrders.push(order);
    } else {
      sellOrders.push(order);
    }
  });
  return { buyOrders, sellOrders };
};

class Market {
  constructor(base) {
    this.base = base;
    this.markets = {};
    this.fee = 578;
    const marketsSubscription = new Subscriptions.Markets({
      callback: this.onMarketUpdate.bind(this)
    });
    listener.addSubscription(marketsSubscription);
  }

  fetchStats(quotes) {
    const quotePromise = quote => Apis.instance().db_api().exec('get_ticker', [this.base, quote]);
    return Promise.all(quotes.map(quotePromise));
  }

  getFee() {
    return this.fee;
  }

  getCallback(pays, receives) {
    if (pays === this.base) {
      if (this.isSubscribed(receives)) {
        return this.markets[receives].callback;
      }
    }
    if (receives === this.base) {
      if (this.isSubscribed(pays)) {
        return this.markets[pays].callback;
      }
    }
    return false;
  }

  getOrdersArray(pays, receives) {
    if (pays === this.base) {
      if (this.isSubscribed(receives)) {
        return this.markets[receives].orders.buy;
      }
    }
    if (receives === this.base) {
      if (this.isSubscribed(pays)) {
        return this.markets[pays].orders.sell;
      }
    }
    return false;
  }

  onMarketUpdate(type, object) {
    switch (type) {
      case 'newOrder': {
        this.onNewLimitOrder(object);
        break;
      }
      case 'deleteOrder': {
        this.onOrderDelete(object);
        break;
      }
      case 'fillOrder': {
        this.onOrderFill(object);
        break;
      }
      default: break;
    }
  }

  onOrderDelete(notification) {
    Object.keys(this.markets).forEach((market) => {
      Object.keys(this.markets[market].orders).forEach((type) => {
        const idx = this.markets[market].orders[type].findIndex(findOrder(notification));
        if (idx >= 0) {
          this.markets[market].orders[type].splice(idx, 1);
          this.markets[market].callback('DELETE ORDER');
        }
      });
    });
  }

  onNewLimitOrder(order) {
    const {
      base: {
        asset_id: pays
      },
      quote: {
        asset_id: receives
      }
    } = order.sell_price;

    const orders = this.getOrdersArray(pays, receives);

    if (orders) {
      orders.push(order);
      const callback = this.getCallback(pays, receives);
      callback('ADD ORDER');
    }
  }

  onOrderFill(data) {
    const {
      order_id: orderId,
      pays: { amount, asset_id: pays },
      receives: { asset_id: receives }
    } = data.op[1];

    const orders = this.getOrdersArray(pays, receives);

    if (orders) {
      const idx = orders.findIndex(findOrder(orderId));
      if (idx !== -1) {
        orders[idx].for_sale -= amount;
        const callback = this.getCallback(pays, receives);
        callback('FILL ORDER');
      }
    }
  }

  isSubscribed(assetId) {
    return (this.markets[assetId] !== undefined);
  }

  setDefaultObjects(assetId) {
    if (!this.markets[assetId]) {
      this.markets[assetId] = {
        orders: {
          buy: [], sell: []
        },
        callback: () => {}
      };
    }
  }

  async subscribeToMarket(assetId, callback) {
    if (assetId === this.base) return;
    const { buyOrders, sellOrders } = await loadLimitOrders(this.base, assetId);
    this.setDefaultObjects(assetId);
    // console.log('setting default: ' + assetId + ' : ', this.markets[assetId]);
    this.markets[assetId].orders.buy = buyOrders;
    this.markets[assetId].orders.sell = sellOrders;
    this.markets[assetId].callback = callback;
    callback();
  }

  unsubscribeFromMarket(assetId) {
    if (this.isSubscribed(assetId)) {
      delete this.markets[assetId];
    }
  }

  unsubscribeFromExchangeRate(assetId) {
    this.unsubscribeFromMarket(assetId);
  }

  unsubscribeFromMarkets() {
    this.markets = {};
  }

  async subscribeToExchangeRate(assetId, amount, callback) {
    let canReceiveInBasePrev = 0;
    const wrappedCallback = () => {
      const canReceiveInBase = this.calcExchangeRate(assetId, 'sell', amount);
      if (canReceiveInBase !== canReceiveInBasePrev && canReceiveInBase > 0) {
        canReceiveInBasePrev = canReceiveInBase;
        callback(assetId, canReceiveInBase);
      }
    };
    await this.subscribeToMarket(assetId, wrappedCallback);
  }

  calcExchangeRate(assetId, weWantTo, amount) {
    let totalPay = amount;
    let totalReceive = 0;

    const requiredType = (weWantTo === 'sell') ? 'buy' : 'sell';
    // console.log('cakc exchange rate for ' + assetId + ': ', this.markets[assetId]);
    const orders = [...this.markets[assetId].orders[requiredType]].sort(
      (a, b) => calcOrderRate(b) - calcOrderRate(a)
    );
    for (let i = 0; i < orders.length; i += 1) {
      const { for_sale: saleAmount, sell_price: price } = orders[i];
      const orderPrice = price.base.amount / price.quote.amount;
      const weCanPayHere = Math.floor(saleAmount / orderPrice);

      if (totalPay > weCanPayHere) {
        totalReceive += parseInt(saleAmount, 10);
        totalPay -= weCanPayHere;
      } else {
        totalReceive += totalPay * orderPrice;
        break;
      }
    }
    return Math.floor(totalReceive);
  }

  generateOrders({ update, balances, baseBalances, userId }) {
    const calculated = utils.getValuesToUpdate(balances, baseBalances, update);
    const sellOrders = [];
    const buyOrders = [];

    Object.keys(calculated.sell).forEach((assetId) => {
      const toSell = calculated.sell[assetId];
      // if (!toSell) return;
      let toReceive = this.calcExchangeRate(assetId, 'sell', toSell);
      const fee = this.getFee(assetId);
      if (toReceive > fee) {
        toReceive -= fee;
        const orderObject = {
          sell: {
            asset_id: assetId,
            amount: toSell
          },
          receive: {
            asset_id: this.base,
            amount: toReceive
          },
          userId,
          fillOrKill: true
        };
        const order = utils.createOrder(orderObject);

        sellOrders.push(order);
      }
    });

    console.log('sell orders: ', sellOrders);


    Object.keys(calculated.buy).forEach((assetId) => {
      let toSellBase = calculated.buy[assetId];
      const fee = this.getFee(assetId);
      if (toSellBase > fee) {
        toSellBase -= fee;
        const toReceive = this.calcExchangeRate(assetId, 'buy', toSellBase);
        if (!toReceive) return;
        const orderObject = {
          sell: {
            asset_id: this.base,
            amount: toSellBase
          },
          receive: {
            asset_id: assetId,
            amount: toReceive
          },
          userId
        };
        const order = utils.createOrder(orderObject);
        buyOrders.push(order);
      }
    });

    console.log('buy orders: ', buyOrders);
    return {
      sellOrders,
      buyOrders
    };
  }
}

const markets = {};
config.marketBases.forEach(item => {
  markets[item] = new Market(item);
});

export default markets;

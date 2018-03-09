import { ChainTypes, TransactionBuilder, ops } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';

export default class Market {
  constructor(transactionFee) {
    this.limitOrders = [];
    this.marketSubscriptions = [];
    this.exchangeRateSubscriptions = [];
    this.transactionFee = transactionFee;
  }

  /**
   * checks subscription
   * @param {string} fromId
   * @param {string} toId
   */
  isSubscribed(fromId, toId) {
    const callback = ([quote, base]) => {
      return quote === fromId && base === toId;
    };
    return this.marketSubscriptions.find(callback);
  }
  /**
   * gets limit orders from market store
   * @param {string} baseId
   * @param {string} quoteId
   */
  getLimitOrders(baseId, quoteId) {
    return this.limitOrders.filter(order => {
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
      return (baseAsset === baseId && quoteAsset === quoteId);
    });
  }
  /**
   * load limit ordesr from api
   * @param {string} baseId
   * @param {string} quoteId
   * @param {number} limit - max orders count to fetch
   */
  static loadLimitOrders(baseId, quoteId, limit = 10000) {
    return Apis.instance().db_api().exec(
      'get_limit_orders',
      [baseId, quoteId, limit]
    );
  }
  /**
   * subscribes to specified market, to keep actual limit orders will be stored
   * in this.limitOrders
   * @param {string} baseId
   * @param {string} quoteId
   */
  async subscribeToMarket(baseId, quoteId) {
    if (baseId === quoteId) return;
    if (!this.isSubscribed(baseId, quoteId)) {
      const orders = await Market.loadLimitOrders(baseId, quoteId);
      this.limitOrders = [...this.limitOrders, ...orders];
      this.marketSubscriptions.push([baseId, quoteId]);
      await Apis.instance().db_api().exec(
        'subscribe_to_market',
        [this.onMarketUpdate.bind(this), baseId, quoteId]
      );
    } else {
      console.warn(`market: already subscribed to ${baseId} <-> ${quoteId}`);
    }
  }
  /**
   * called when order was filled in network, corrects for_sale value
   * for specified order. Called by subscription callback
   * @param {Object} data - fill order operation json-api representation
   */
  onOrderFill(data) {
    const { order_id: orderId, pays: { amount } } = data;
    const idx = this.limitOrders.findIndex(({ id }) => id === orderId);
    if (idx !== -1) {
      this.limitOrders[idx].for_sale -= amount;

      const order = this.limitOrders[idx];
      this.notifyExchangeRateSubscribers(
        order.sell_price.base.asset_id,
        order.sell_price.quote.asset_id
      );
    } else {
      console.warn('market: cant find order to fill');
    }
  }
  /**
   * called when order was deleted in network. Called by subscription callback
   * @param {string} notification - order id
   */
  onOrderDelete(notification) {
    const idx = this.limitOrders.findIndex(e => {
      return e.id === notification;
    });
    if (idx >= 0) {
      this.limitOrders.splice(idx, 1);
    } else {
      console.warn('market: unknown order removed', notification);
    }
  }
  /**
   * called when new order appears in network. Called by subscription callback
   * @param {Object} order - order json-api representation
   */
  onNewLimitOrder(order) {
    this.limitOrders.push(order);
    this.notifyExchangeRateSubscribers(
      order.sell_price.base.asset_id,
      order.sell_price.quote.asset_id
    );
  }
  /**
   * subscription callback
   * @callback subscribeToMarketCallback
   * @param {Array} notifications - array containing array of notifications
   */
  onMarketUpdate([notifications]) {
    const handleNotification = (notification) => {
      if (Array.isArray(notification)) {
        // operation notification
        const [[operation, data]] = notification;
        if (operation === ChainTypes.operations.fill_order) {
          this.onOrderFill(data);
        } else {
          console.warn('market: unknown operation ', notification);
        }
      } else if (typeof notification === 'object') {
        // new order
        const { id } = notification;
        // make sure its not a call order
        if (id.substr(0, 3) !== '1.8') {
          this.onNewLimitOrder(notification);
        }
      } else if (typeof notification === 'string') {
        this.onOrderDelete(notification);
      } else {
        console.warn('market: unhandled notification ', notification);
      }
    };
    notifications.forEach(handleNotification.bind(this));
  }
  /**
   * subscribes to exchange rate for specified assets and amount to exchange
   * @param {Object} from - asset object
   * @param {Object} to - asset object
   * @param {number} amount - "from" asset balance
   * @param {subscribeToMarketCallback} callback
   */
  async subscribeExchangeRate(from, to, amount, callback) {
    if (from.id === amount.id) {
      callback(amount);
      return;
    }
    await this.subscribeToMarket(from.id, to.id);
    const subscription = { from, to, amount, callback };
    this.notifyExchangeRate(subscription);
    this.exchangeRateSubscriptions.push(subscription);
  }

  /**
   * unsubscribes from exchenge rate updates, in case when balance has changed i.e.
   * @param {Object} from - asset object
   * @param {Object} to - asset object
   * @amount {number} amount - specified for subscription balance
   */
  unsubscribeExchangeRate(quote, base, amount) {
    const idx = this.exchangeRateSubscriptions.findIndex(subscription => {
      const { from, to } = subscription;
      return base === to.id && quote === from.id && subscription.amount === amount;
    });
    if (idx >= 0) {
      this.exchangeRateSubscriptions.splice(idx, 1);
    }
  }
  /**
   * notifies quote -> base exchange rate subscribers
   * @param {string} baseId
   * @param {string} quoteId
   */
  notifyExchangeRateSubscribers(baseId, quoteId) {
    this.exchangeRateSubscriptions.forEach(subscription => {
      const { from, to } = subscription;
      if (baseId === to.id && quoteId === from.id) this.notifyExchangeRate(subscription);
    });
  }
  /**
   * called when exchange rate has changed
   * @callback exchangeRateCallback
   * @param {number} value - amount of "to" asset you can get from exchange
   */

  /**
   * calls back specified subscription
   * @param {Object} subscription
   * @param {Object} subscription.from - asset object
   * @param {Object} subscription.to - asset object
   * @param {number} subscription.amount - "from" asset balance
   * @param {exchangeRateCallback} subscription.callback
   */
  notifyExchangeRate({ from, to, amount, callback }) {
    callback(this.calcExchangeRate(from, to, amount));
  }
  /**
   * returns market fee percent scaled to 0..1, and create_limit_order
   * operation fee value in "from" asset
   * @param {Object} from
   * @param {Object} to
   */
  getExchangeFees(from, to) {
    const marketFeePercent = to.options.market_fee_percent / 10000;

    if (from.id === to.id) {
      return {
        marketFeePercent,
        transactionFee: this.transactionFee
      };
    }
    const { options: { core_exchange_rate: coreExchangeRate } } = from;

    // for some uncertain reason core_exchange_rate base is not
    // always bts, it can be quote too
    const quotient = coreExchangeRate.base.asset_id === from.id
      ? coreExchangeRate.base.amount
      : coreExchangeRate.quote.amount;

    const divisor = coreExchangeRate.base.asset_id === from.id
      ? coreExchangeRate.quote.amount
      : coreExchangeRate.base.amount;

    // transaction fee equivalent in 'from' asset
    const transactionFee = Math.ceil((this.transactionFee * quotient) / divisor);
    return {
      transactionFee,
      marketFeePercent
    };
  }
  /**
   * calculates amount of "to" asset you can exchange amount of "from" asset to
   * @param {Object} from
   * @param {Object} to
   * @param {number} amount
   */
  calcExchangeRate(from, to, amount) {
    if (from.id === to.id) return amount;
    const { marketFeePercent } = this.getExchangeFees(from, to);
    const orders = this.getExchangeOrders(from, to, amount);
    return orders.reduce(
      (res, { order, amount: orderAmount }) => {
        return res + Market.calcOrderOutput(order, orderAmount, marketFeePercent);
      },
      0
    );
  }
  /**
   * calculates amount of base asset you can get from order with specified
   * amount of quote asset
   * @param {Object} order - limit order json-api representation
   * @param {number} amount - quote asset amount
   * @param {number} marketFeePercent - base asset market fee scaled to 0..1
   */
  static calcOrderOutput(order, amount, marketFeePercent) {
    const {
      sell_price: {
        base: {
          amount: baseAmount
        },
        quote: {
          amount: quoteAmount
        }
      }
    } = order;
    return Math.floor((amount * (baseAmount / quoteAmount)) * (1 - marketFeePercent));
  }
  /**
   * calculates amount of quote asset you can send to seller
   * @param {Object} order - order json-api representation
   */
  static orderMaxToFill(order) {
    const {
      for_sale: forSale,
      sell_price: {
        quote: {
          amount: quoteAmount
        },
        base: {
          amount: baseAmount
        }
      }
    } = order;
    return Math.floor((forSale * quoteAmount) / baseAmount);
  }
  /**
   * returns set of orders you need to exchange specified amount of "from" asset
   * to "to" asset
   * @param {Object} from
   * @param {Object} to
   * @param {number} amount
   */
  getExchangeOrders(from, to, amount) {
    // TODO: calculate optimal orders set
    const { transactionFee } = this.getExchangeFees(from, to);
    if (transactionFee > amount) {
      return [];
    }
    // sort function
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
    const orders = this.getLimitOrders(to.id, from.id)
      .filter(o => o.for_sale > 10)
      .sort((a, b) => calcOrderRate(b) - calcOrderRate(a));

    const res = [];
    let accumulator = amount;
    for (let i = 0; i < orders.length; i += 1) {
      const order = orders[i];
      const orderCanBuy = Market.orderMaxToFill(order);

      if (orderCanBuy > accumulator - transactionFee) {
        res.push({
          amount: accumulator - transactionFee,
          order
        });
        break;
      } else {
        res.push({
          amount: orderCanBuy,
          order
        });
        accumulator -= orderCanBuy + transactionFee;
      }
    }
    return res;
  }
  /**
   * returns set of orders you need to exchange specified set of assets balances
   * to base asset
   * @param {Object} balances - { assetId: balance }
   * @param {Object} base - asset object
   * @param {string} accountId - seller account id
   */
  getExchangeToBaseOrders(balances, base, accountId) {
    return Promise.all(balances.filter(({ asset: { id } }) => id !== base.id)
      .reduce(
        (res, { asset, balance }) => {
          return res.concat(this.getExchangeOrders(asset, base, balance));
        },
        []
      )
      .map(({ amount, order }) => Market.getFillingOrder(order, amount, accountId)));
  }
  /**
   * returns set of orders youn need to exchange specified amount of base asset
   * to specified distribution of target assets
   * @param {Object} base - asset object
   * @param {number} amount - amount of base asset
   * @param {Object} distribution - {assetId: share}, 0 <= share <= 1
   * @param {string} accountId
   */
  getExchangeToDistributionOrders(base, amount, distribution, accountId) {
    return Promise.all(distribution.filter(({ asset: { id } }) => id !== base.id)
      .reduce(
        (res, { asset, share }) => {
          return res.concat(this.getExchangeOrders(base, asset, Math.floor(amount * share)));
        },
        []
      )
      .map(({ amount: orderAmount, order }) => {
        return Market.getFillingOrder(order, orderAmount, accountId);
      }));
  }
  /**
   * returns new order object you need to create to fill specified order
   * with specified amount of quote asset.
   * @param {Object} order
   * @param {number} amount
   * @param {string} accountId
   * @param {boolean} btsFee - if true, sets order transaction fee in quote,
   * in bts otherwise
   */
  static async getFillingOrder(order, amount, accountId, btsFee = false) {
    // TODO: handle empty fee pool
    const {
      sell_price: {
        base: { amount: base, asset_id: baseAsset },
        quote: { amount: quote, asset_id: quoteAsset }
      }
    } = order;
    const expiration = new Date();
    expiration.setYear(expiration.getFullYear() + 5);
    const toReceive = Math.floor((amount * base) / quote);

    const newOrder = {
      seller: accountId,
      amount_to_sell: {
        asset_id: quoteAsset,
        amount
      },
      min_to_receive: {
        asset_id: baseAsset,
        amount: toReceive
      },
      expiration,
      fill_or_kill: true
    };

    const dummyTransaction = new TransactionBuilder();
    const operation = dummyTransaction.get_type_operation(
      'limit_order_create',
      newOrder
    );
    const serializedOperation = ops.operation.toObject(operation);
    const [fee] = await Apis.instance().db_api().exec(
      'get_required_fees',
      [[serializedOperation], btsFee ? '1.3.0' : quoteAsset]
    );

    return { ...newOrder, fee };
  }
}


import { ChainTypes, TransactionBuilder, ops } from 'bitsharesjs';
import { Apis } from 'bitsharesjs-ws';
import API from '../api';

export default class Market {
  constructor(transactionFee) {
    this.limitOrders = [];
    this.marketSubscriptions = [];
    this.exchangeRateSubscriptions = [];
    this.transactionFee = transactionFee;
  }
  isSubscribed(from, to) {
    return this.marketSubscriptions.find(
      ([quote, base]) => (quote == from && base == to) || (quote == to && base == from)
    );
  }
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
      return (baseAsset == baseId && quoteAsset == quoteId) 
        || (baseAsset == quoteId && quoteAsset == baseId);
    });
  }
  loadLimitOrders(baseId, quoteId, limit = 200) {
    return Apis.instance().db_api().exec(
      "get_limit_orders",
      [baseId, quoteId, limit]
    );
  }
  async subscribeToMarket(baseId, quoteId) {
    if(baseId == quoteId) return;
    if (!this.isSubscribed(baseId, quoteId)) {
      const orders = await this.loadLimitOrders(baseId, quoteId);
      this.limitOrders = [...this.limitOrders, ...orders];
      this.marketSubscriptions.push([baseId, quoteId]);
      return Apis.instance().db_api().exec(
        "subscribe_to_market", 
        [this.onMarketUpdate.bind(this), baseId, quoteId]
      );
    } else {
      console.warn(`market: already subscribed to ${baseId} <-> ${quoteId}`);
    }
  }
  onOrderFill(notification) {
    const [[, data]] = notification;
    const {fee, order_id, account_id, pays: {amount}} = data;
    const idx = this.limitOrders.findIndex(({ id }) => id == order_id);
    if (idx != -1) {
      this.limitOrders[idx].for_sale -= amount;

      const order = this.limitOrders[idx];
      this.notifyExchangeRateSubscribers(
        order.sell_price.base.asset_id,
        order.sell_price.quote.asset_id
      );
    } else {
      console.warn("market: cant find order to fill");
    }
  }
  onOrderDelete(notification) {
    const idx = this.limitOrders.findIndex(e => {
      return String(e.id) == notification
    });
    if (idx >= 0) {
      this.limitOrders.splice(idx,1);
    } else {
      console.warn("market: unknown order removed", notification);
    }
  }
  onNewLimitOrder(order) {
    this.limitOrders.push(order);
    this.notifyExchangeRateSubscribers(
      order.sell_price.base.asset_id,
      order.sell_price.quote.asset_id
    );
  }
  onMarketUpdate([notifications]) {
    const handleNotification = (notification) => {
      if (Array.isArray(notification)) {
        //operation notification
        const [[operation, data]] = notification;
        if (operation == ChainTypes.operations.fill_order) {
          this.onOrderFill(notification);
        } else {
          console.warn("market: unknown operation ", notification);
        }
      } else if (typeof notification == 'object') {
        //new order 
        const { id } = notification
        //make sure its not a call order
        if(id.substr(0,3) != '1.8') {
          this.onNewLimitOrder(notification);
        }
      } else if (typeof notification == 'string') {
        this.onOrderDelete(notification);
      } else {
        console.warn("market: unhandled notification ", notification);
      }
    }
    notifications.forEach(handleNotification.bind(this));
  }
  async subscribeExchangeRate(from, to, amount, callback) {
    if(from.id == amount.id) {
      callback(amount);
      return;
    }
    await this.subscribeToMarket(from.id, to.id);
    const subscription = { from, to, amount, callback };
    this.notifyExchangeRate(subscription);
    this.exchangeRateSubscriptions.push(subscription);
  }
  unsubscribeExchangeRate(from, to, amount) {
    const idx = this.exchangeRateSubscriptions.findIndex(subscription => {
      const { from, to } = subscription;
      return base == to.id && quote == from.id && subscription.amount == amount
    })
    if (idx >= 0) {
      this.exchangeRateSubscriptions.splice(idx, 1);
    }
  }
  notifyExchangeRateSubscribers(baseId, quoteId) {
    this.exchangeRateSubscriptions.forEach(subscription => {
      const { from, to } = subscription;
      if (base == to.id && quote == from.id) this.notifyExchangeRate(subscription);
    })
  }
  notifyExchangeRate({ from, to, amount, callback }) {
    callback(this.calcExchangeRate(from, to, amount));
  }
  getExchangeFees (from, to) {
    const marketFeePercent = to.options.market_fee_percent/10000;
    const { options: { core_exchange_rate }} = from;

    //for some uncertain reason core_exchange_rate base is not
    //always bts, it can be quote too
    const quotient = core_exchange_rate.base.asset_id == from.id 
      ? core_exchange_rate.base.amount 
      : core_exchange_rate.quote.amount

    const divisor = core_exchange_rate.base.asset_id == from.id 
      ? core_exchange_rate.quote.amount 
      : core_exchange_rate.base.amount

    //transaction fee equivalent in "from" asset
    const transactionFee = Math.ceil(this.transactionFee * quotient  / divisor);
    return {
      transactionFee,
      marketFeePercent
    }
  }
  calcExchangeRate (from, to, amount) {
    if (from.id == to.id) return amount;
    const { marketFeePercent } = this.getExchangeFees(from, to);
    const orders = this.getExchangeOrders(from, to, amount);
    return orders.reduce(
      (res, { order, amount }) => res += Market.calcOrderOutput(order, amount, marketFeePercent),
      0
    );
  }
  static calcOrderOutput (order, amount, marketFeePercent) {
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
    return Math.floor((amount * (baseAmount/quoteAmount)) * (1 - marketFeePercent));
  }
  static orderMaxToFill (order) {
    return Math.floor(order.for_sale * order.sell_price.quote.amount / order.sell_price.base.amount);
  }
  getExchangeOrders (from, to, amount) {
    const { transactionFee, marketFeePercent } = this.getExchangeFees(from, to);
    if (transactionFee > amount) {
      return [];
    }
    //sort function
    const calcOrderRate = (order) => {
      //total amount available to fill
      const orderCanBuy = Market.orderMaxToFill(order);
      const toSell = amount > orderCanBuy ? orderCanBuy : amount;
      const toBuy = (toSell - transactionFee) * order.sell_price.base.amount / order.sell_price.quote.amount;
      return toBuy * (1 - marketFeePercent) / toSell;
    }
    const orders = this.getLimitOrders(to.id, from.id)
    //filter orders that sells "from-asset"
      .filter(o => o.sell_price.base.asset_id == to.id)
      .sort((a,b) => calcOrderRate(b) - calcOrderRate(a));

    const res = []
    for (const order of orders) {
      const orderCanBuy = Market.orderMaxToFill(order);

      if (orderCanBuy > amount - transactionFee) {
        res.push({
          amount: amount - transactionFee,
          order
        });
        break
      } else {
        res.push({
          amount: orderCanBuy,
          order
        });
        amount -= orderCanBuy + transactionFee;
      }
    }
    return res;
  }
  getExchangeToBaseOrders (balances, base, accountId) {
    return Promise.all(
      balances.filter(({ asset: { id }}) => id != base.id)
      .reduce((res, { asset, balance }) => res.concat(this.getExchangeOrders(asset, base, balance)), [])
      .map(({ amount, order }) => Market.getFillingOrder(order, amount, accountId))
    );
  }
  getExchangeToDistributionOrders (base, amount, distribution, accountId) {
    return Promise.all(
      distribution.filter(({ asset: { id }}) => id != base.id)
      .reduce(
        (res, { asset, share }) => res.concat(this.getExchangeOrders(base, asset, Math.floor(amount * share))),
        []
      )
      .map(({ amount, order }) => Market.getFillingOrder(order, amount, accountId))
    );
  }
  static async getFillingOrder(order, amount, accountId, btsFee = false) {
    //TODO: handle empty fee pool
    const {
      sell_price: {
        base: { amount: base, asset_id: baseAsset},
        quote: { amount: quote, asset_id: quoteAsset}
      }
    } = order;
    const expiration = new Date();
    expiration.setYear(expiration.getFullYear() + 5);
    const toReceive = Math.floor(amount*base/quote);

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
      expiration: expiration,
      fill_or_kill: true
    };

    const serializedOperation = ops.operation.toObject(
      (new TransactionBuilder).get_type_operation('limit_order_create', newOrder)
    );
    const [fee] = await Apis.instance().db_api().exec(
      'get_required_fees',
      [[serializedOperation], btsFee ? '1.3.0' : quoteAsset]);

    return { ...newOrder, fee};
    //return newOrder;
  }
}


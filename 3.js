import { Apis } from 'bitsharesjs-ws';
import * as utils from './src/utils/market';
import listener from './src/services/api/chain-listener';
import Subscriptions from './src/services/api/subscriptions';

class Markets {
  constructor(transactionFee) {
    this.markets = {};
    this.transactionFee = transactionFee;
    const marketsSubscription = new Subscriptions.Markets({
      callback: this.onMarketUpdate.bind(this)
    });
    listener.addSubscription(marketsSubscription);
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
    Object.keys(this.markets).forEach((base) => {
      Object.keys(this.markets[base]).forEach((quote) => {
        const idx = this.markets[base][quote].findIndex(e => {
          return e.id === notification;
        });
        if (idx >= 0) {
          this.markets[base][quote].splice(idx, 1);
        }
      });
    });
  }

  onNewLimitOrder(order) {
    const {
      base: {
        asset_id: baseId
      },
      quote: {
        asset_id: quoteId
      }
    } = order.sell_price;
    if (this.isSubscribed(baseId, quoteId)) {
      this.markets[baseId][quoteId].push(order);
    }
  }

  onOrderFill(data) {
    const {
      order_id: orderId,
      pays: { amount, asset_id: baseId },
      receives: { asset_id: quoteId }
    } = data.op[1];

    if (this.isSubscribed(baseId, quoteId)) {
      const idx = this.markets[baseId][quoteId].findIndex(({ id }) => id === orderId);
      if (idx !== -1) {
        this.markets[baseId][quoteId][idx].for_sale -= amount;
      }
    }
  }

  isSubscribed(baseId, quoteId) {
    return (this.markets[baseId] !== undefined && this.markets[baseId][quoteId] !== undefined);
  }

  getLimitOrders(baseId, quoteId) {
    return this.markets[baseId][quoteId].orders;
  }

  setDefaultObjects(baseId, quoteId) {
    if (this.markets[baseId] === undefined) {
      this.markets[baseId] = {};
    }

    if (this.markets[baseId][quoteId] === undefined) {
      this.markets[baseId][quoteId] = [];
    }
  }

  setLimitOrders(baseId, quoteId, orders) {
    this.setDefaultObjects(baseId, quoteId);
    this.markets[baseId][quoteId] = orders;
  }

  async subscribeToMarket(baseId, quoteId) {
    if (baseId === quoteId) return;
    const { baseOrders, quoteOrders } = await utils.loadLimitOrders(baseId, quoteId);
    this.setLimitOrders(baseId, quoteId, baseOrders);
    this.setLimitOrders(quoteId, baseId, quoteOrders);
    console.log(this.markets);
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
        return res + utils.calcOrderOutput(order, orderAmount, marketFeePercent);
      },
      0
    );
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
      const orderCanBuy = utils.orderMaxToFill(order);

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
      .map(({ amount, order }) => utils.getFillingOrder(order, amount, accountId)));
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
        return utils.getFillingOrder(order, orderAmount, accountId);
      }));
  }
}

const main = async () => {
  await Apis.instance('wss://openledger.hk/ws', true).init_promise;

  listener.enable();
  const market = new Markets(92);
  await market.subscribeToMarket('1.3.0', '1.3.113');
};

main().catch(console.error);

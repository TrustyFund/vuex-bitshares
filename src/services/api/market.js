import { Apis } from 'bitsharesjs-ws';
import API from '../api';
import * as utils from '../../utils';
import { TransactionBuilder } from 'bitsharesjs';

/**
 * Converts set of assets to another through base asset
 * final output values is non-deterministic, so it sets as distribution
 * of each asset 0..1 of total amount equivalent in base asset.
 * Returns set of output balances
 * @param {Object} balances - input { assetId: amount }
 * @param {Object} distribution - output asset distribution {assetId: distr}, 0<=distr<=0
 * @param {String} base - base asset id
 * @param {String} accountId
 * @param {Object} key - active key of specified account
 */
//TODO: handle transaction errors
const exchange = async (balances, distribution, base, accountId, key) => {
  const result = {
    [base]: balances[base] || 0
  }

  const rawSellOrders = await Promise.all(
    Object.keys(balances)
      .filter(key => key!=base)
      .map(key => API.Assets.getExchangeOrders(key, base, balances[key]))
  );
  const sellOrders = rawSellOrders.reduce((res, o) => [...res, ...o],[]);
  if (sellOrders.length) {
    const { [base]: baseToReceive } = await fillOrders(sellOrders, accountId, key);
    result[base] += baseToReceive;
  }
  
  const rawBuyOrders = await Promise.all(
    Object.keys(distribution)
      .filter(key => key!=base)
      .map(key => API.Assets.getExchangeOrders(
        base,
        key,
        Math.floor(distribution[key]*baseAmount) - 1
      ))
  );
  const buyOrders = rawBuyOrders.reduce((res, o) => [...res, ...o],[]);
  if (buyOrders.length) {
    return Object.assign(result, await fillOrders(buyOrders, accountId, key));
  } else {
    return result;
  }
}

/**
 * Recieves set of orders and creates set of responding
 * fill-or-kill orders with specified amounts
 * @param {Array} orders - array of objects { order, amount }
 * @param {String} accountId
 * @param {Object} key
 */

const fillOrders = async (orders, accountId, key) => {
  const result = {}; 
  const tr = new TransactionBuilder();
  orders.forEach(({ order, amount }) => {
    const {
      sell_price: {
        base: { amount: base, asset_id: baseAsset},
        quote: { amount: quote, asset_id: quoteAsset}
      }
    } = order;
    const expiration = new Date();
    expiration.setYear(expiration.getFullYear() + 5);
    const toReceive = Math.floor(amount*base/quote)-1;
    if(!result[baseAsset]) {
      result[baseAsset] = 0;
    }
    result[baseAsset] += toReceive;

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
    tr.add_type_operation('limit_order_create', newOrder);
  })
  API.Transactions.signTransaction(tr, {active: key, owner: key});
  await tr.update_head_block();
  await tr.set_required_fees();
  await tr.broadcast();
  return result;
}

/**
 * retruns set of quote -> base limit orders
 * @param {String} base - to asset id
 * @param {String} quote - from asset id
 * @param {number} limit
 */
const getMarketOrders = async (base, quote, limit = 200) => {
  const orders = await Apis.instance().db_api().exec("get_limit_orders", [base, quote, limit]);
  return orders;
}

/**
 * returns array of objects {order, amount} with json-api object representation
 * and amount to buy from this order
 * @param {String} from - quote id
 * @param {String} to - base id
 * @param {number} amount of quote asset
 */
const getExchangeOrders = async (from, to, amount) => {
  //TODO: handle fees
  const orders = await getMarketOrders(to, from);
  const res = []
  for (const order of orders) {
    if (order.for_sale > amount) {
      res.push({
        amount,
        order
      });
      break
    } else {
      res.push({
        amount: order.for_sale,
        order
      });
      amount -= order.for_sale;
    }
  }
  return res;
}

/**
 * Returns exchange rate from one to another asset by fetching orders from market
 * @param {String} from - quote asset id
 * @param {String} to - base asset id
 * @param {number} total - amount of quote asset
 */
const getExchangeRate = async (from, to, total) => {
  const orders = await getExchangeOrders(from, to, total);
  return orders.reduce(
    (res, { order, amount }) => {
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
      return res += (amount/total) * (quoteAmount/baseAmount);
    },
    0
  );
};

export default {
  exchange,
  getExchangeRate,
  getMarketOrders
};

import { Apis } from 'bitsharesjs-ws';
import { TransactionBuilder, ops } from 'bitsharesjs';

export const loadLimitOrders = async (baseId, quoteId, limit = 20000) => {
  const orders = await Apis.instance().db_api().exec(
    'get_limit_orders',
    [baseId, quoteId, limit]
  );
  const baseOrders = [];
  const quoteOrders = [];
  orders.forEach((order) => {
    if (order.sell_price.base.asset_id === baseId) {
      baseOrders.push(order);
    } else {
      quoteOrders.push(order);
    }
  });
  return { baseOrders, quoteOrders };
};

/**
  * calculates amount of base asset you can get from order with specified
  * amount of quote asset
  * @param {Object} order - limit order json-api representation
  * @param {number} amount - quote asset amount
  * @param {number} marketFeePercent - base asset market fee scaled to 0..1
*/
export const calcOrderOutput = (order, amount, marketFeePercent) => {
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
};

/**
 * calculates amount of quote asset you can send to seller
 * @param {Object} order - order json-api representation
*/

export const orderMaxToFill = (order) => {
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
};

/**
  * returns new order object you need to create to fill specified order
  * with specified amount of quote asset.
  * @param {Object} order
  * @param {number} amount
  * @param {string} accountId
  * @param {boolean} btsFee - if true, sets order transaction fee in quote,
  * in bts otherwise
*/
export const getFillingOrder = async (order, amount, accountId, btsFee = false) => {
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
};

import { Apis } from 'bitsharesjs-ws';

const getLimitOrders = async ({ baseId, quoteId, limit = 500 }) => {
  const orders = await Apis.instance().db_api().exec(
    'get_limit_orders',
    [baseId, quoteId, limit]
  );
  const buy = [];
  const sell = [];
  orders.forEach((order) => {
    if (order.sell_price.base.asset_id === baseId) {
      buy.push(order);
    } else {
      sell.push(order);
    }
  });
  return { buy, sell };
};

export default {
  getLimitOrders
};

import Vue from 'vue';
import API from '../services/api';


const imitialState = {
  globalMarketId: '1.3.0',
  markets: {}
};

const SUBSCRIBE_TO_MARKET_REQUEST = 'SUBSCRIBE_TO_MARKET_REQUEST';
const SUBSCRIBE_TO_MARKET_COMPLETE = 'SUBSCRIBE_TO_MARKET_COMPLETE';
const RECEIVE_LIMIT_ORDER_UPDATE = 'RECEIVE_LIMIT_ORDER_UPDATE';
const RECEIVE_DELETE_ORDER_UPDATE = 'RECEIVE_DELETE_ORDER_UPDATE';
const RECEIVE_FILL_ORDER_UPDATE = 'RECEIVE_FILL_ORDER_UPDATE';

const actions = {
  subscribeToMarket: async (store, { baseId, quoteId }) => {
    const { commit } = store;
    commit(SUBSCRIBE_TO_MARKET_REQUEST, { baseId, quoteId });
    const orders = await API.Market.getLimitOrders({ baseId, quoteId });

    const subscription = new API.Subscriptions.Markets({
      baseId,
      quoteId,
      callback: (type, update) => {
        actions.processUpdate(store, { baseId, quoteId, type, update });
      }
    });
    API.ChainListener.addSubscription(subscription);
    commit(SUBSCRIBE_TO_MARKET_COMPLETE, { baseId, quoteId, orders });
  },
  processUpdate: (store, { baseId, quoteId, type, update }) => {
    const { commit } = store;
    switch (type) {
      case 'newOrder': {
        commit(RECEIVE_LIMIT_ORDER_UPDATE, { baseId, quoteId, update });
        break;
      }
      case 'deleteOrder': {
        commit(RECEIVE_DELETE_ORDER_UPDATE, { baseId, quoteId, update });
        break;
      }
      case 'fillOrder': {
        commit(RECEIVE_FILL_ORDER_UPDATE, { baseId, quoteId, update });
        break;
      }
      default: break;
    }
  }
};

const findOrderById = (orderId) => {
  return (order) => orderId === order.id;
};


const mutations = {
  [SUBSCRIBE_TO_MARKET_REQUEST](state, { baseId, quoteId }) {
    if (!state.markets[baseId]) {
      Vue.set(state.markets, baseId, {});
    }
    Vue.set(state.markets[baseId], quoteId, {});
  },
  [SUBSCRIBE_TO_MARKET_COMPLETE](state, { baseId, quoteId, orders }) {
    Vue.set(state.markets[baseId][quoteId], 'orders', { ...orders });
  },
  [RECEIVE_LIMIT_ORDER_UPDATE](state, { baseId, quoteId, update }) {
    const {
      base: {
        asset_id: pays
      },
      quote: {
        asset_id: receives
      }
    } = update.sell_price;
    if (pays === baseId && receives === quoteId) {
      state.markets[baseId][quoteId].orders.buy.push(update);
    }
    if (pays === quoteId && receives === baseId) {
      state.markets[baseId][quoteId].orders.sell.push(update);
    }
    Vue.set(state.markets, baseId, state.markets[baseId]);
  },
  [RECEIVE_DELETE_ORDER_UPDATE](state, { baseId, quoteId, update }) {
    Object.keys(state.markets[baseId][quoteId].orders).forEach((type) => {
      const idx = state.markets[baseId][quoteId].orders[type].findIndex(findOrderById(update));
      if (idx >= 0) {
        state.markets[baseId][quoteId].orders[type].splice(idx, 1);
        console.log('delete order');
        Vue.set(state.markets, baseId, state.markets[baseId]);
      }
    });
  },
  [RECEIVE_FILL_ORDER_UPDATE](state, { baseId, quoteId, update }) {
    const {
      order_id: orderId,
      pays: { amount, asset_id: pays },
      receives: { asset_id: receives }
    } = update.op[1];

    let type = '';

    // Type is reverse here because update is arriving on opposite order
    if (pays === baseId && receives === quoteId) {
      type = 'sell';
    }
    if (pays === quoteId && receives === baseId) {
      type = 'buy';
    }

    if (type) {
      const orders = state.markets[baseId][quoteId].orders[type];
      const idx = orders.findIndex(findOrderById(orderId));
      if (idx !== -1) {
        orders[idx].for_sale -= amount;
        Vue.set(state.markets, baseId, state.markets[baseId]);
      }
    }
  }

};

export default {
  actions,
  mutations,
  state: imitialState,
  namespaced: true
};

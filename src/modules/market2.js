import Vue from 'vue';
import config from '../../config.js';
import API from '../services/api';

const FETCH_MARKET_HISTORY_REQUEST = 'FETCH_MARKET_HISTORY_REQUEST';
const FETCH_MARKET_HISTORY_COMPLETE = 'FETCH_MARKET_HISTORY_COMPLETE';
const FETCH_MARKET_HISTORY_ERROR = 'FETCH_MARKET_HISTORY_ERROR';

const FETCH_ASSETS_HISTORY_REQUEST = 'FETCH_ASSETS_HISTORY_REQUEST';
const FETCH_ASSETS_HISTORY_COMPLETE = 'FETCH_ASSETS_HISTORY_COMPLETE';
const FETCH_ASSETS_HISTORY_ERROR = 'FETCH_ASSETS_HISTORY_ERROR';

const SUBSCRIBE_TO_EXCHANGE_RATE = 'SUBSCRIBE_TO_EXCHANGE_RATE';

const SUB_TO_MARKET_REQUEST = 'SUB_TO_MARKET_REQUEST';
const SUB_TO_MARKET_COMPLETE = 'SUB_TO_MARKET_COMPLETE';
const UNSUB_FROM_MARKET_COMPLETE = 'UNSUB_FROM_MARKET_COMPLETE';

const SUB_TO_BALANCE_MARKETS_COMPLETE = 'SUB_TO_BALANCE_MARKETS_COMPLETE';

const UPDATE_MARKET_PRICE = 'UPDATE_MARKET_PRICE';
const UPDATE_MARKET_ORDERS = 'UPDATE_MARKET_ORDERS';

const initialState = {
  systemBaseId: config.defaultTradingBase,
  pending: false,
  subscribed: false,
  error: false,
  markets: {},
  history: {}
};

const actions = {
  fetchMarketHistory: async ({ commit }, { baseId, assetId, days }) => {
    commit(FETCH_MARKET_HISTORY_REQUEST, { baseId });
    const prices = await API.Assets.fetchPriceHistory(baseId, assetId, days);
    if (!prices) {
      commit(FETCH_MARKET_HISTORY_ERROR);
      return false;
    }
    commit(FETCH_MARKET_HISTORY_COMPLETE, { baseId, assetId, prices });
    return true;
  },
  fetchAssetsHistory: (store, { baseId, assetsIds, days }) => {
    const { commit } = store;
    commit(FETCH_ASSETS_HISTORY_REQUEST);

    Promise.all(assetsIds.map(async (assetId) => {
      const prices = await actions.fetchMarketHistory(store, { baseId, assetId, days });
      if (!prices) throw new Error('error market history');
    })).then(() => {
      commit(FETCH_ASSETS_HISTORY_COMPLETE);
    }).catch(() => {
      commit(FETCH_ASSETS_HISTORY_ERROR);
    });
  },
  subscribeToExchangeRate: async (store, { baseId, assetId, balance }) => {
    const { commit } = store;
    commit(SUB_TO_MARKET_REQUEST, { baseId, assetId });

    const market = API.Market[baseId];
    await market.subscribeToExchangeRate(assetId, balance, (id, baseAmount) => {
      if (!baseAmount) return;
      const price = baseAmount / balance;
      commit(UPDATE_MARKET_PRICE, { baseId, assetId, price });

      // WTF THIS TYT DELAET? @roma219
      store.dispatch('transactions/createOrdersFromDistribution', null, { root: true });
      console.log(assetId + ' new bts amount: : ' + baseAmount);

      const orders = market.getOrderBook(id);
      commit(UPDATE_MARKET_ORDERS, { baseId, assetId, orders });
    });
    console.log('SUBSCRIBED TO : ' + assetId + ' : ' + balance);
  },
  subscribeToExchangeRates(store, { baseId, balances }) {
    const { commit } = store;
    const assetsIds = Object.keys(balances);

    Promise.all(assetsIds.map(assetId => {
      const { balance } = balances[assetId];
      return actions.subscribeToExchangeRate(store, { baseId, assetId, balance });
    })).then(() => {
      commit(SUB_TO_BALANCE_MARKETS_COMPLETE);
      console.log('subscribed to markets successfully');
    });
  },
  subscribeToMarket: async ({ commit }, { baseId, assetId }) => {
    commit(SUB_TO_MARKET_REQUEST, { baseId, assetId });
    await API.Market[baseId].subscribeToMarket(assetId, () => {
      const orders = API.Market[baseId].getOrderBook(assetId);
      commit(UPDATE_MARKET_ORDERS, { baseId, assetId, orders });
    });
    const orders = API.Market[baseId].getOrderBook(assetId);
    commit(SUB_TO_MARKET_COMPLETE, { baseId, assetId, orders });
  },
  unsubscribeFromMarket: ({ commit }, { baseId }) => {
    API.Market[baseId].unsubscribeFromMarkets();
    commit(UNSUB_FROM_MARKET_COMPLETE, { baseId });
  }
};

const mutations = {
  [FETCH_MARKET_HISTORY_REQUEST](state, { baseId }) {
    if (state.history[baseId] === undefined) {
      state.history[baseId] = {};
    }
    state.pending = true;
  },
  [FETCH_MARKET_HISTORY_COMPLETE](state, { baseId, assetId, prices }) {
    state.pending = false;
    state.history[baseId][assetId] = prices;
    state.history = { ...state.history };
  },
  [FETCH_MARKET_HISTORY_ERROR](state) {
    state.pending = false;
    state.error = true;
  },
  [FETCH_ASSETS_HISTORY_REQUEST](state) {
    state.pending = true;
  },
  [FETCH_ASSETS_HISTORY_COMPLETE](state) {
    state.pending = false;
  },
  [FETCH_ASSETS_HISTORY_ERROR](state) {
    state.pending = false;
    state.error = true;
  },
  [SUB_TO_BALANCE_MARKETS_COMPLETE](state) {
    state.subscribed = true;
  },
  [UPDATE_MARKET_PRICE](state, { baseId, assetId, price }) {
    if (!state.history[baseId][assetId]) Vue.set(state.history[baseId], assetId, {});
    Vue.set(state.history[baseId][assetId], 'last', price);
  },
  [SUB_TO_MARKET_REQUEST](state, { baseId, assetId }) {
    state.pending = true;
    state.markets[baseId] = {};
    state.markets[baseId][assetId] = {};
  },
  [SUB_TO_MARKET_COMPLETE](state, { baseId, assetId, orders }) {
    state.pending = false;
    state.markets[baseId][assetId] = orders;
    state.markets = { ...state.markets };
  },
  [UPDATE_MARKET_ORDERS](state, { baseId, assetId, orders }) {
    state.markets[baseId][assetId] = orders;
    state.markets = { ...state.markets };
  },
  [UNSUB_FROM_MARKET_COMPLETE](state, { baseId }) {
    state.pending = false;
    delete (state.markets[baseId]);
  },
  [SUBSCRIBE_TO_EXCHANGE_RATE](state) {
    console.log('exchange sub', state);
  }
};

const getters = {
  getMarketHistory: state => baseId => state.history[baseId] || {},
  getSystemBaseId: state => state.systemBaseId,
  getAssetMultiplier: state => {
    return (assetId) => {
      const baseId = state.systemBaseId;
      if (!state.history[baseId] || !state.history[baseId][assetId]) {
        return {
          first: 0,
          last: 0
        };
      }
      return {
        first: 1 / state.history[baseId][assetId].first,
        last: 1 / state.history[baseId][assetId].last
      };
    };
  },
  isError: state => state.error,
  isPending: state => state.pending,
  isSubscribed: state => state.subscribed,
  getMarketOrders: state => baseId => state.markets[baseId]
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
  namespaced: true
};

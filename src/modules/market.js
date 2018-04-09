import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';

const BtsMarket = API.Market['1.3.0'];

const actions = {
  fetchMarketHistory: (store, { assetsIds, baseId, days }) => {
    const { commit, rootGetters } = store;
    const assets = rootGetters['assets/getAssets'];
    const baseAsset = assets[baseId];

    commit(types.FETCH_MARKET_HISTORY_REQUEST, { baseId });
    // console.log('fetching history : ', days, assetsIds);
    Promise.all(assetsIds.map(async (assetId) => {
      const prices = await API.Assets.fetchPriceHistory(baseAsset, assets[assetId], days);
      if (assetId === '1.3.2418') console.log(prices);
      if (!prices) throw new Error('error market history');
      return {
        assetId,
        prices
      };
    })).then((pricesObjects) => {
      const prices = pricesObjects.reduce((result, obj) => {
        result[obj.assetId] = obj.prices;
        return result;
      }, {});
      commit(types.FETCH_MARKET_HISTORY_COMPLETE, { days, prices });
    }).catch((err) => {
      console.log(err);
      commit(types.FETCH_MARKET_HISTORY_ERROR);
    });
  },

  subscribeToMarket(store, { balances }) {
    const { commit } = store;
    const assetsIds = Object.keys(balances);

    Promise.all(assetsIds.map(assetId => {
      const { balance } = balances[assetId];
      return BtsMarket.subscribeToExchangeRate(assetId, balance, (id, amount) => {
        if (!amount) return;
        const rate = amount / balance;
        console.log(assetId + ' new bts amount: : ' + amount);
        actions.updateMarketPrice(store, {
          assetId: id,
          price: rate
        });
      }).then(() => {
        console.log('SUBSCRIBED TO : ' + assetId + ' : ' + balance);
      });
    })).then(() => {
      commit(types.SUB_TO_MARKET_COMPLETE);
      console.log('subscribed to market successfully');
    });
  },

  unsubscribeFromMarket(store, { balances }) {
    const { commit } = store;
    const assetsIds = Object.keys(balances);
    BtsMarket.unsubscribeFromMarkets();
    Promise.all(assetsIds.map(id => {
      console.log('unsubscribing: ', id);
      return BtsMarket.unsubscribeFromExchangeRate(id);
    })).then(() => {
      commit(types.UNSUB_FROM_MARKET_COMPLETE);
      console.log('unsubscribed from market');
    });
  },

  updateMarketPrice(store, { assetId, price }) {
    const { commit } = store;
    commit(types.UPDATE_MARKET_PRICE, { assetId, price });
    store.dispatch('transactions/createOrdersFromDistribution', null, { root: true });
  }
};

const getters = {
  getBaseAssetId: state => state.baseAssetId,
  getAssetMultiplier: state => {
    return (assetId) => {
      if (!state.history[1][assetId]) {
        return {
          first: 0,
          last: 0
        };
      }
      return {
        first: 1 / state.history[1][assetId].first,
        last: 1 / state.history[1][assetId].last
      };
    };
  },
  getMarketHistory24: state => state.history[1],
  getMarketHistory7: state => state.history[7],
  isFetching: state => state.pending,
  isError: state => state.error,
  isSubscribed: state => state.subscribed
};

const initialState = {
  history: {
    1: {},
    7: {}
  },
  pending: false,
  error: false,
  baseAssetId: null,
  subscribed: false,
  prices: {}
};

const mutations = {
  [types.FETCH_MARKET_HISTORY_REQUEST](state, { baseId }) {
    state.fetching = true;
    state.baseAssetId = baseId;
  },
  [types.FETCH_MARKET_HISTORY_COMPLETE](state, { prices, days }) {
    state.fetching = false;
    Object.keys(prices).forEach(assetId => {
      Vue.set(state.history[days], assetId, prices[assetId]);
    });
  },
  [types.FETCH_MARKET_HISTORY_ERROR](state) {
    state.fetching = false;
    state.error = true;
  },
  [types.UPDATE_MARKET_PRICE](state, { assetId, price }) {
    if (!state.history[1][assetId]) Vue.set(state.history[1], assetId, {});
    Vue.set(state.history[1][assetId], 'last', price);
  },
  // [types.UPDATE_MARKET_PRICE](state, { assetId, price }) {
  //   if (!state.prices[assetId]) Vue.set(state.prices, assetId, {});
  //   Vue.set(state.prices, assetId, price);
  // },
  [types.SUB_TO_MARKET_COMPLETE](state) {
    state.subscribed = true;
  },
  [types.UNSUB_FROM_MARKET_COMPLETE](state) {
    state.subscribed = false;
  }
};

export default {
  state: initialState,
  actions,
  getters,
  mutations,
  namespaced: true
};

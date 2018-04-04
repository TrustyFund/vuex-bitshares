import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';

const actions = {
  fetchMarketHistory: (store, { assetsIds, baseId, days }) => {
    const { commit, rootGetters } = store;
    const assets = rootGetters['assets/getAssets'];
    const baseAsset = assets[baseId];

    commit(types.FETCH_MARKET_HISTORY_REQUEST, { baseId, days });
    Promise.all(assetsIds.map(async (assetId) => {
      const prices = await API.Assets.fetchPriceHistory(baseAsset, assets[assetId], days);
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
      commit(types.FETCH_MARKET_HISTORY_COMPLETE, { prices });
    }).catch(() => {
      commit(types.FETCH_MARKET_HISTORY_ERROR);
    });
  },

  subscribeToMarket(store, { balances }) {
    const { commit } = store;
    const assetsIds = Object.keys(balances);

    Promise.all(assetsIds.map(assetId => {
      const { balance } = balances[assetId];
      // if (!balance) return;
      // console.log('SUBBING ' + assetId + ' : ' + balance);
      return API.Market.subscribeToExchangeRate(assetId, balance, (id, amount) => {
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
    const assetsIds = Object.keys(balances);
    Promise.all(assetsIds.map(id => {
      console.log('unsubscribing: ', id);
      return API.Market.unsubscribeFromExchangeRate(id);
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
      if (!state.history[assetId]) {
        return {
          first: 0,
          last: 0
        };
      }
      return {
        first: 1 / state.history[assetId].first,
        last: 1 / state.history[assetId].last
      };
    };
  },
  getMarketHistory: state => state.history,
  isFetching: state => state.pending,
  isError: state => state.error,
  isSubscribed: state => state.subscribed
};

const initialState = {
  history: {},
  days: 7,
  pending: false,
  error: false,
  baseAssetId: null,
  subscribed: false,
  prices: {}
};

const mutations = {
  [types.FETCH_MARKET_HISTORY_REQUEST](state, { baseId, days }) {
    state.fetching = true;
    state.baseAssetId = baseId;
    state.days = days;
  },
  [types.FETCH_MARKET_HISTORY_COMPLETE](state, { prices }) {
    state.fetching = false;
    Object.keys(prices).forEach(assetId => {
      Vue.set(state.history, assetId, prices[assetId]);
    });
  },
  [types.FETCH_MARKET_HISTORY_ERROR](state) {
    state.fetching = false;
    state.error = true;
  },
  [types.UPDATE_MARKET_PRICE](state, { assetId, price }) {
    if (!state.history[assetId]) Vue.set(state.history, assetId, {});
    Vue.set(state.history[assetId], 'last', price);
  },
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

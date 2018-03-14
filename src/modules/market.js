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
    }).catch(error => {
      commit(types.FETCH_MARKET_HISTORY_ERROR);
    });
  },

  subscribeToMarket(store, { balances }) {
    const { getters, rootGetters } = store;
    const assets = rootGetters['assets/getAssets'];
    const baseAssetId = getters.getBaseAssetId;
    const baseAsset = assets[baseAssetId];
    const assetsIds = Object.keys(balances);


    assetsIds.forEach(id => {
      const quoteAsset = assets[id];
      const balance = balances[id].balance;
      if (!balance) return;
      API.Market.subscribeExchangeRate(baseAsset, quoteAsset, balance, (from, to, amount) => {
        const rate = balance / amount;
        actions.updateMarketPrice(store, { 
          assetId: quoteAsset.id, 
          price: rate
        })
      });
    });
  },

  unsubscribeFromMarket(store, { balances }) {
    const { getters, rootGetters } = store;
    const assets = rootGetters['assets/getAssets'];
    const baseAssetId = getters.getBaseAssetId;
    const baseAsset = assets[baseAssetId];
    const assetsIds = Object.keys(balances);

    assetsIds.forEach(id => {
      const quoteAsset = assets[id];
      const balance = balances[id].balance;
      if (!balance) return;
      API.Market.unsubscribeExchangeRate(baseAsset.id, quoteAsset.id, balance);
    });
  },

  updateMarketPrice(store, { assetId, price }) {
    console.log(assetId + ' : ' + price);
    const { commit } = store;
    commit(types.UPDATE_MARKET_PRICE, { assetId, price });
  }
};

const getters = {
  getBaseAssetId: state => state.baseAssetId,
  getAssetMultiplier: state => {
    return (assetId) => {
      if (!state.history[assetId]) return {
        first: 0,
        last: 0
      };
      return {
        first: 1 / state.history[assetId].first,
        last: 1 / state.history[assetId].last
      }
    }
  },
  getMarketHistory: state => state.history,
  isFetching: state => state.pending,
  isError: state => state.error
};

const initialState = {
  history: {},
  days: 7,
  pending: false,
  error: false,
  baseAssetId: null,
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
  }
};

export default {
  state: initialState,
  actions,
  getters,
  mutations,
  namespaced: true
};

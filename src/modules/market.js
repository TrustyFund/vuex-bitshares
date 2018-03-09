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
  subscribeToMarket(store) {

  },
  unsubscribeFromMarket(store) {

  },
  updateMarketPrice(store, { assetId, price }) {

  }
};

const getters = {
  getBaseAssetId: state => state.baseAssetId,
  getAssetMultiplier: state => {
    return (assetId) => {
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
      state.history[assetId] = prices[assetId];
    });
  },
  [types.FETCH_MARKET_HISTORY_ERROR](state) {
    state.fetching = false;
    state.error = true;
  },
  [types.FETCH_MARKET_PRICES_UPDATE](state, { id, price }) {
    if (!state.prices[id]) state.prices[id] = {};
    state.prices[id].last = price;
  }
};

export default {
  state: initialState,
  actions,
  getters,
  mutations,
  namespaced: true
};

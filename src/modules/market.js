import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';
import config from '../../config';

const BtsMarket = API.Market['BTS'];

const actions = {
  async fetchMarketStats(store, base) {
    const market = API.Market[base];
    const quotes = config.defaultMarkets[base];
    const stats = await market.fetchStats(quotes);
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
  getPrices: state => state.prices,
  getPriceById: state => {
    return (assetId) => {
      if (assetId === state.baseId) return 1;
      return state.prices[assetId] || 0;
    };
  },
  getMarketBases: state => state.marketBases,
  isFetching: state => state.pending,
  isError: state => state.error,
  isSubscribed: state => state.subscribed,
};

const initialState = {
  pending: false,
  error: false,
  baseAssetId: null,
  subscribed: false,
  prices: {},
  baseId: '1.3.0',
  marketBases: config.marketBases
};

const mutations = {
  [types.UPDATE_MARKET_PRICE](state, { assetId, price }) {
    Vue.set(state.prices, assetId, price);
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

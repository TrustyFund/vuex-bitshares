import PersistentStorage from '../services/persistent-storage';
import API from '../services/api';
import * as types from '../mutations';

const initialState = {
  depositAddress: '',
  pending: false,
  coins: {},
  error: false
};

const actions = {
  async fetchDepositAddress(store, { asset }) {
    const { commit, rootGetters } = store;
    const user = rootGetters['account/getCurrentUserName'];

    commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_REQUEST);

    const cachedAddresses = PersistentStorage.getOpenledgerAddresses();

    if (cachedAddresses[asset]) {
      console.log('FROM CACHE');
      const address = cachedAddresses[asset];
      commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE, { address });
    } else {
      console.log('LOAD', asset, user);
      const lastAddress = await API.Openledger.getLastDepositAdress({
        asset,
        user
      });

      if (lastAddress.success) {
        const address = lastAddress.data;
        cachedAddresses[asset] = address;
        PersistentStorage.setOpenledgerAddresses(cachedAddresses);
        commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE, { address });
      } else {
        const newAddress = await API.Openledger.requestDepositAdress({
          asset,
          user
        });

        if (newAddress.success) {
          const address = newAddress.data;
          cachedAddresses[asset] = address;
          PersistentStorage.setOpenledgerAddresses(cachedAddresses);
          commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE, { address });
        } else {
          const { error } = lastAddress;
          commit(types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_ERROR, { error });
        }
      }
    }
  },
  async fetchCoins({ commit }) {
    commit(types.FETCH_OPENLEDGER_COINS_REQUEST);

    const fetchResult = await API.Openledger.fetchCoins();


    if (!fetchResult.success) {
      const { error } = fetchResult;
      commit(types.FETCH_OPENLEDGER_COINS_ERROR, { error });
    }

    const coins = {};

    fetchResult.data.forEach((coin) => {
      const { coinType, gateFee, intermediateAccount } = coin;
      coins[coinType] = { gateFee, intermediateAccount };
    });

    commit(types.FETCH_OPENLEDGER_COINS_COMPLETE, { coins });
  }
};

const getters = {
  getDepositAddress: state => state.depositAddress,
  getCoinsData: state => state.coins
};

const mutations = {
  [types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_REQUEST]: (state) => {
    state.pending = true;
    state.depositAddress = initialState.depositAddress;
    state.error = null;
  },
  [types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_COMPLETE]: (state, { address }) => {
    state.depositAddress = address;
    state.pending = false;
  },
  [types.FETCH_OPENLEDGER_DEPOSIT_ADDRESS_ERROR]: (state, { error }) => {
    state.error = error;
    state.pending = false;
  },
  [types.FETCH_OPENLEDGER_COINS_REQUEST]: (state) => {
    state.pending = true;
  },
  [types.FETCH_OPENLEDGER_COINS_COMPLETE]: (state, { coins }) => {
    state.pending = false;
    state.coins = coins;
  },
  [types.FETCH_OPENLEDGER_COINS_ERROR]: (state, { error }) => {
    state.pending = false;
    state.error = error;
  }
};

export default {
  state: initialState,
  actions,
  getters,
  mutations,
  namespaced: true
};

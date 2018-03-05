import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';


const actions = {
  fetchAndSubscribe: async (store, { userId }) => {
    await actions.fetchUserOperations(store, { userId });
    await actions.subscribeToUserOperations(store, { userId });
  },

  fetchUserOperations: async (store, { userId }) => {
    const { commit } = store;
    commit(types.FETCH_USER_OPERATIONS_REQUEST);
    const result = await API.Operations.getUserOperations({ userId });
    if (result.success) {
      // fetch assets used in operations
      store.dispatch('assets/fetchAssets', { assets: result.data.assetsIds }, { root: true });
      commit(types.FETCH_USER_OPERATIONS_COMPLETE, {
        operations: result.data.operations
      });
    } else {
      commit(types.FETCH_USER_OPERATIONS_ERROR, {
        error: result.error
      });
    }
  },

  addUserOperation: async (store, { operation, userId }) => {
    const { commit } = store;
    // parse operation data for better format & information
    const parsedData = await API.Operations.parseOperations({
      operations: [operation],
      userId
    });
    if (!parsedData) return;
    store.dispatch('assets/fetchAssets', { assets: parsedData.assetsIds }, { root: true });
    commit(types.ADD_USER_OPERATION, {
      operation: parsedData.operations[0]
    });
  },

  subscribeToUserOperations(store, { userId }) {
    const { commit } = store;
    API.ChainListener.subscribeToUserOperations({ userId, callback: (operation) => {
      actions.addUserOperation(store, { operation, userId });
    }});
    commit(types.SUBSCRIBED_TO_USER_OPERATIONS);
  },

  unsubscribeFromUserOperations(store) {
    const { commit } = store;
    API.ChainListener.stopListetingToUserOperations();
    commit(types.UNSUBSCRIBED_FROM_USER_OPERATIONS);
  }
}

const getters = {
  getOperations: state => state.list,
  isFetching: state => state.pending
};

const initialState = {
  list: [],
  pending: false,
  error: null,
  subscribed: false
};

const mutations = {
  [types.FETCH_USER_OPERATIONS_REQUEST]: (state) => {
    state.pending = true;
    state.error = null;
  },
  [types.FETCH_USER_OPERATIONS_COMPLETE]: (state, { operations }) => {
    state.pending = false;
    Vue.set(state, 'list', operations);
  },
  [types.FETCH_USER_OPERATIONS_ERROR]: (state, { error }) => {
    state.pending = false;
    state.error = error;
  },
  [types.ADD_USER_OPERATION]: (state, { operation }) => {
    const newList = state.list.slice();
    newList.unshift(operation);
    Vue.set(state, 'list', newList);
  },
  [types.SUBSCRIBED_TO_USER_OPERATIONS]: (state) => {
    state.subscribed = true;
  },
  [types.UNSUBSCRIBED_FROM_USER_OPERATIONS]: (state) => {
    state.subscribed = false;
  }
};

export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};

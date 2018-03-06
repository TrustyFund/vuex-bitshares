import Vue from 'vue';
import * as types from '../mutations';
import API from '../services/api';


const actions = {
  /**
   * Dispatches actions to fetch user operations & subscribe to new operations of this user
   * @param {String} userId - user's id
   */
  fetchAndSubscribe: async (store, { userId, limit }) => {
    await actions.fetchUserOperations(store, { userId, limit });
    await actions.subscribeToUserOperations(store, { userId });
  },

  /**
   * Fetches user operations
   * @param {String} userId - user's id
   */
  fetchUserOperations: async (store, { userId, limit }) => {
    const { commit } = store;
    commit(types.FETCH_USER_OPERATIONS_REQUEST);
    const result = await API.Operations.getUserOperations({ userId, limit });
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
    return result;
  },

  /**
   * Add new operation to operation's list. This action is dispatched on a callback
    to new user's operation received
   * @param {String} userId - user's id
   * @param {Object} operation - operation date object
   */
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

  /**
   * Subscribes to new user's operations
   * @param {String} userId - user's id
   */
  subscribeToUserOperations(store, { userId }) {
    const { commit } = store;
    API.ChainListener.subscribeToUserOperations({ 
      userId,
      callback: (operation) => {
        actions.addUserOperation(store, { operation, userId });
      }
    });
    commit(types.SUBSCRIBE_TO_USER_OPERATIONS);
  },

  /**
   * Unsubscribes from new user's operations
   */
  unsubscribeFromUserOperations(store) {
    const { commit } = store;
    API.ChainListener.unsubscribeFromUserOperations();
    commit(types.UNSUBSCRIBE_FROM_USER_OPERATIONS);
  }
};

const getters = {
  getOperations: state => state.list,
  isFetching: state => state.pending,
  isError: state => state.error,
  isSubscribed: state => state.subscribed
};

const initialState = {
  list: [],
  pending: false,
  error: false,
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
  [types.SUBSCRIBE_TO_USER_OPERATIONS]: (state) => {
    state.subscribed = true;
  },
  [types.UNSUBSCRIBE_FROM_USER_OPERATIONS]: (state) => {
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

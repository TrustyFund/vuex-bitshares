import * as types from '../mutations';
import API from '../services/api';

const actions = {
  fetchUserOperations: async (store, { userId }) => {
    const { commit } = store;
    commit(types.FETCH_USER_OPERATIONS_REQUEST);
    const result = await API.Operations.getUserOperations({ userId });
    if (result.success === true) {
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
  }
}

const getters = {
  getOperations: state => state.list,
  isFetching: state => state.pending
};

const initialState = {
  list: [],
  pending: false,
  error: null
};

const mutations = {
  [types.FETCH_USER_OPERATIONS_REQUEST]: (state) => {
    state.pending = true;
    state.error = null;
  },
  [types.FETCH_USER_OPERATIONS_COMPLETE]: (state, { operations }) => {
    state.pending = false;
    state.list = operations;
  },
  [types.FETCH_USER_OPERATIONS_ERROR]: (state, { error }) => {
    state.pending = false;
    state.error = error;
  }
};

export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};

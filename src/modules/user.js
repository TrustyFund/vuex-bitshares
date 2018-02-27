import * as types from '../mutations';
import * as actions from '../actions/user';
import * as getters from '../getters/user';

const initialState = {
  account: null,
  balances: [],
  pending: false,
  error: false
};

const mutations = {
  [types.FETCH_USER_REQUEST](state) {
    state.pending = true;
    state.error = false;
  },
  [types.FETCH_USER_COMPLETE](state, result) {
    state.account = result.account;
    state.balances = result.balances;
    state.pending = false;
  },
  [types.FETCH_USER_ERROR](state) {
    state.pending = false;
    state.error = true;
  },
};

export default {
  state: initialState,
  actions,
  getters,
  mutations,
  namespaced: true
};

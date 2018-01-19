import * as types from '../mutations';
import * as actions from '../actions/user';
import * as getters from '../getters/user';

let state = {
  account: null,
  balances: [],
  pending: false
}

let mutations = {
  [types.FETCH_USER_REQUEST] (state) {
    state.pending = true;
  },
  [types.FETCH_USER_COMPLETE] (state,result){
    state.account = result.account;
    state.balances = result.balances;
    state.pending = false;
    console.log("USER GET",state)
  },
  [types.FETCH_USER_ERROR] (state) {
    state.pending = false;
  },
}

export default {
  state,
  actions,
  getters,
  mutations
}
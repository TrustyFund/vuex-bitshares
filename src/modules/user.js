import * as types from '../mutations';
import * as actions from '../actions/user';
import * as getters from '../getters/user';

const balancesToObject = (balancesArr) => {
  const obj = {};
  balancesArr.forEach(item => {
    obj[item.asset_type] = item;
  });
  return obj;
};


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
    state.balances = balancesToObject(result.balances);
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
  mutations
};

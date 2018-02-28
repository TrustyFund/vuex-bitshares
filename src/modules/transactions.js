import * as types from '../mutations';
import * as actions from '../actions/transactions';

const initialState = {
  pending: false,
  error: null
};

const mutations = {
  [types.TRANSFER_ASSET_REQUEST](state) {
    state.pending = true;
  },
  [types.TRANSFER_ASSET_ERROR](state, error) {
    state.error = error;
    state.pending = false;
  },
  [types.TRANSFER_ASSET_COMPLETE](state, transaction) {
    state.pending = false;
    state.transaction = transaction;
    console.log('TRANSFER_ASSET_COMPLETE', state);
  },
};

export default {
  state: initialState,
  actions,
  mutations,
  namespaced: true
};

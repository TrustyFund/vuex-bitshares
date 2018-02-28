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
  [types.TRANSFER_ASSET_COMPLETE](state) {
    state.pending = false;
  },
};

export default {
  state: initialState,
  actions,
  mutations,
  namespaced: true
};

import * as types from '../mutations';
import * as actions from '../actions/transactions';

const initialState = {
  list: {}
};

const mutations = {
  [types.TRANSFER_ASSET_REQUEST](state) {
    console.log('TRANSFER_ASSET_REQUEST', state);
  },
  [types.TRANSFER_ASSET_ERROR](state) {
    console.log('TRANSFER_ASSET_ERROR', state);
  },
  [types.TRANSFER_ASSET_COMPLETE](state) {
    console.log('TRANSFER_ASSET_COMPLETE', state);
  },
};

export default {
  state: initialState,
  actions,
  mutations,
  namespaced: true
};

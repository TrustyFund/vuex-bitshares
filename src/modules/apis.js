import * as types from '../mutations';
import * as actions from '../actions/apis';

const initialState = {
  connected: false
};

const mutations = {
  [types.WS_CONNECTED](state) {
    state.connected = true;
  },
  [types.WS_DISCONNECTED](state) {
    state.connected = false;
  },
  [types.WS_ERROR](state) {
    state.connected = false;
  }
};

export default {
  state: initialState,
  actions,
  mutations
};

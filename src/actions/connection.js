import API from '../services/api';
import * as types from '../mutations';

/**
 * Initializes connection to Bitsharesjs-WS
 */
export const initConnection = ({ commit, getters }, changeNode) => {
  let active = true;
  const updateConnectionStatus = async (status) => {
    if (!active) return;
    const wsConnected = getters.isWsConnected;
    console.log('Connection status : ', status);
    commit(types.RPC_STATUS_UPDATE, { status });
    if (status === 'error' || status === 'closed') {
      commit(types.WS_DISCONNECTED);
      active = false;
      await API.Connection.disconnect();
      initConnection({ commit, getters }, true);
    }
    if (!wsConnected && (status === 'realopen' || status === 'reconnect')) {
      commit(types.WS_CONNECTED);
    }
    if (status === 'realopen') {
      API.ChainListener.enable();
    }
  };

  API.Connection.connect(updateConnectionStatus, changeNode);
};

import API from '../services/api';
import * as types from '../mutations';

/**
 * Initializes connection to Bitsharesjs-WS
 */
export const initConnection = ({ commit, getters }) => {
  const updateConnectionStatus = (status) => {
    const wsConnected = getters.isWsConnected;
    console.log('Connection status : ', status);
    commit(types.RPC_STATUS_UPDATE, { status });
    if (status === 'error' || status === 'closed') {
      API.ChainListener.disable();
      commit(types.WS_DISCONNECTED);
    }
    if (!wsConnected && (status === 'realopen' || status === 'reconnect')) {
      commit(types.WS_CONNECTED);
    }
    if (status === 'realopen') {
      API.ChainListener.enable();
    }
  };

  API.Connection.connect(updateConnectionStatus);
};


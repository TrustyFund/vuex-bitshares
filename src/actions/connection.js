import API from '../services/api';
import * as types from '../mutations';

/**
 * Initializes connection to Bitsharesjs-WS
 */
export const initConnection = ({ commit, getters }) => {
  const updateConnectionStatus = (status) => {
    const prevStatus = getters.getRpcStatus;
    const wsConnected = getters.isWsConnected;
    console.log('connection status : ', status);
    if (status === 'reconnect' || status === 'close') {
      API.connect(updateConnectionStatus);
    }
    commit(types.RPC_STATUS_UPDATE, { status });
    if (prevStatus === null && status === 'error') commit(types.WS_DISCONNECTED);
    if (!wsConnected && status === 'realopen') commit(types.WS_CONNECTED);
  };

  API.connect(updateConnectionStatus);
};


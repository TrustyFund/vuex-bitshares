import * as apis from '../services/api';
import * as types from '../mutations';

/**
 * Inits main APIs
 * @param {function} callback - callback for status update
 */
export const initApis = ({ commit }, callback) => {
  const connectionStatus = (status) => {
    switch (status) {
      case 'closed':
        commit(types.WS_DISCONNECTED);
        break;
      case 'error':
        commit(types.WS_ERROR);
        break;
      default:
    }
  };

  apis.initApis(connectionStatus).then(() => {
    commit(types.WS_CONNECTED);
    callback();
  });
};


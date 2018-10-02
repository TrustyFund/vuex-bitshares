import { mutations } from './mutations'
import actions from './actions'
import getters from './getters'

export const getDefaultState = () => {
  return {
    userId: null,
    keys: null,
    userType: null,
    wallet: {
      passwordPubkey: null,
      encryptedBrainkey: null,
      encryptionKey: null,
      aesPrivate: null
    }
  }
}


export default {
  state: getDefaultState(),
  mutations,
  actions,
  getters,
  namespaced: true
};

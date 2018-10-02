import { mutations } from './mutations'
import actions from './actions'
import getters from './getters'

const initialState = {
  keys: null,
  userId: null,
  userType: null
};


export default {
  state: initialState,
  mutations,
  actions,
  getters,
  namespaced: true
};

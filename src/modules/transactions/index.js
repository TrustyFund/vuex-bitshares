import { mutations } from './mutations';
import { getDefaultState } from './defaultState';
import actions from './actions';
import getters from './getters';


export default {
  state: getDefaultState(),
  mutations,
  actions,
  getters,
  namespaced: true
};

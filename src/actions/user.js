import * as types from '../mutations';
import API from '../services/api';

/**
 * Function to convert array of balances to object with keys as assets ids
 * @param {Array} balancesArr - array of balance objects
 */
const balancesToObject = (balancesArr) => {
  const obj = {};
  balancesArr.forEach(item => {
    obj[item.asset_type] = item;
  });
  return obj;
};

/**
 * Fetches users objects from bitsharesjs-ws
 * @param {string} username - name of user to fetch
 */
export const fetchUser = async ({ commit }, nameOrId) => {
  commit(types.FETCH_USER_REQUEST);
  const result = await API.Account.getUser(nameOrId);
  if (result.success) {
    const user = result.data;
    user.balances = balancesToObject(user.balances);
    commit(types.FETCH_USER_COMPLETE, user);
  } else {
    commit(types.FETCH_USER_ERROR);    
  }
  return result;
};

/**
 * Checks username for existance
 * @param {string} username - name of user to fetch
 */
export const checkUsername = async (state, { username }) => {
  return new Promise(async (resolve) => {
    const result = await API.User.Get(username);
    if (result[0]) resolve(false);
    resolve(true);
  });
};

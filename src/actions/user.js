import * as types from '../mutations';
import { User } from '../services/api';

const balancesToObject = (balancesArr) => {
  const obj = {};
  balancesArr.forEach(item => {
    obj[item.asset_type] = item;
  });
  return obj;
};

export const fetchUser = async ({ commit }, username) => {
  commit(types.FETCH_USER_REQUEST);
  const user = await User.Get(username);
  if (user) {
    const userData = user[0][1];
    userData.balances = balancesToObject(userData.balances);
    commit(types.FETCH_USER_COMPLETE, userData);
    return userData;
  }
  commit(types.FETCH_USER_ERROR);
  return null;
};

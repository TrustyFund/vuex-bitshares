import * as types from '../mutations';
import { User } from '../services/api';

export const fetchUser = async ({ commit }, username) => {
  commit(types.FETCH_USER_REQUEST);
  const user = await User.Get(username);
  if (user) {
    commit(types.FETCH_USER_COMPLETE, user[0][1]);
    return user[0][1];
  }
  commit(types.FETCH_USER_ERROR);
  return null;
};
